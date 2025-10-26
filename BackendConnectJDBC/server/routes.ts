import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { hashPassword, comparePassword, requireAuth, requireAdmin } from "./auth";
import { 
  insertUserSchema, 
  loginSchema, 
  insertTransactionSchema,
  updateTransactionStatusSchema,
  updateProfileSchema 
} from "@shared/schema";

// Fraud detection logic
function detectFraud(
  amount: number, 
  location: string, 
  userCountry: string,
  recentTransactions: any[] = []
): 'pending' | 'flagged' {
  // Flag if amount is over $5000
  if (amount > 5000) {
    return 'flagged';
  }
  
  // Check for transactions from different locations within short time span (1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentDifferentLocation = recentTransactions.find(transaction => {
    const transactionTime = new Date(transaction.timestamp);
    const isDifferentLocation = transaction.location.toLowerCase() !== location.toLowerCase();
    const isWithinTimeWindow = transactionTime >= oneHourAgo;
    return isDifferentLocation && isWithinTimeWindow;
  });
  
  if (recentDifferentLocation) {
    return 'flagged';
  }
  
  // Skip foreign transaction check if user country is not set
  if (!userCountry || userCountry.trim() === '') {
    return 'pending';
  }
  
  // Extract country from location (usually last part after comma)
  const locationParts = location.split(',').map(p => p.trim());
  const locationCountry = locationParts[locationParts.length - 1]?.toLowerCase() || '';
  
  // Skip if location doesn't have a clear country component
  if (!locationCountry) {
    return 'pending';
  }
  
  const normalizedUserCountry = userCountry.toLowerCase().trim();
  
  // Comprehensive country name variations and aliases
  const countryAliases: Record<string, string[]> = {
    'usa': ['united states', 'us', 'usa', 'america', 'united states of america', 'u.s.a', 'u.s.'],
    'uk': ['united kingdom', 'uk', 'great britain', 'britain', 'england', 'scotland', 'wales', 'northern ireland', 'u.k.'],
    'uae': ['united arab emirates', 'uae', 'emirates', 'u.a.e.'],
    'canada': ['canada', 'ca', 'can'],
    'mexico': ['mexico', 'méxico', 'mx', 'mex'],
    'india': ['india', 'in', 'ind', 'bharat'],
    'china': ['china', 'cn', 'chn', 'prc', 'peoples republic of china'],
    'japan': ['japan', 'jp', 'jpn', 'nippon'],
    'germany': ['germany', 'de', 'deu', 'deutschland'],
    'france': ['france', 'fr', 'fra'],
    'australia': ['australia', 'au', 'aus', 'oz'],
    'brazil': ['brazil', 'br', 'bra', 'brasil'],
  };
  
  // Check if location country matches user country exactly
  if (locationCountry === normalizedUserCountry) {
    return 'pending';
  }
  
  // Check aliases - find if user country is in any alias group
  for (const [key, aliases] of Object.entries(countryAliases)) {
    if (aliases.includes(normalizedUserCountry)) {
      // User country is recognized - check if location matches any alias
      if (aliases.includes(locationCountry)) {
        return 'pending'; // Same country group
      }
    }
  }
  
  // Check if location country is in any group where user country also appears
  for (const [key, aliases] of Object.entries(countryAliases)) {
    const userInGroup = aliases.includes(normalizedUserCountry);
    const locationInGroup = aliases.includes(locationCountry);
    
    if (userInGroup && locationInGroup) {
      return 'pending'; // Both in same group
    }
  }
  
  // Countries don't match - flag as potential foreign transaction
  return 'flagged';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
  });

  app.set('trust proxy', 1);
  // Enforce SESSION_SECRET in all environments
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable must be set");
  }

  app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: 'user', // Default role
      });

      res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, role } = loginSchema.parse(req.body);

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if user has the selected role (if role was specified)
      if (role && user.role !== role) {
        return res.status(403).json({ message: `You don't have ${role} access` });
      }

      // Set session with user's actual role from database
      req.session.userId = user.id;
      req.session.role = user.role;

      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        }
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const userId = req.session.userId!;

      // If changing password, verify current password
      if (validatedData.currentPassword && validatedData.newPassword) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const isValid = await comparePassword(validatedData.currentPassword, user.password);
        if (!isValid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await hashPassword(validatedData.newPassword);
        await storage.updateUser(userId, { password: hashedPassword });
      }

      // Update other fields
      const updateData: any = {};
      if (validatedData.username) updateData.username = validatedData.username;
      if (validatedData.fullName) updateData.fullName = validatedData.fullName;
      if (validatedData.country) updateData.country = validatedData.country;
      if (validatedData.phoneNumber) updateData.phoneNumber = validatedData.phoneNumber;

      if (Object.keys(updateData).length > 0) {
        await storage.updateUser(userId, updateData);
      }

      res.json({ message: "Profile updated successfully" });
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(400).json({ message: error.message || "Profile update failed" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUser(req.session.userId!);
      res.json(transactions);
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get('/api/transactions/all', requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error: any) {
      console.error("Get all transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', requireAuth, async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const userId = req.session.userId!;

      // Get user to check country for fraud detection
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get recent transactions for location-based fraud detection
      const recentTransactions = await storage.getTransactionsByUser(userId);

      // Fraud detection
      const amount = parseFloat(validatedData.amount);
      const status = detectFraud(amount, validatedData.location, user.country, recentTransactions);

      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        amount: validatedData.amount,
        location: validatedData.location,
        description: validatedData.description || null,
        status,
      });

      res.status(201).json(transaction);
    } catch (error: any) {
      console.error("Create transaction error:", error);
      res.status(400).json({ message: error.message || "Failed to create transaction" });
    }
  });

  app.patch('/api/transactions/:id/status', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = updateTransactionStatusSchema.parse(req.body);

      const transaction = await storage.updateTransactionStatus(id, status);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error: any) {
      console.error("Update transaction status error:", error);
      res.status(400).json({ message: error.message || "Failed to update transaction" });
    }
  });

  app.delete('/api/transactions/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTransaction(id);

      if (!success) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json({ message: "Transaction deleted successfully" });
    } catch (error: any) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
