import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { Express } from "express";
import * as bcrypt from "bcrypt";
import { storage, initStorage } from "./storage";
import { log } from "./vite";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      isAdmin?: boolean;
    }
  }
}

// Compare password with hashed version
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    return await bcrypt.compare(supplied, stored);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    // If not a bcrypt hash or another error occurs, try direct comparison for demo accounts
    return supplied === stored;
  }
}

export async function setupAuth(app: Express) {
  // Initialize the storage
  const storageInstance = await initStorage();
  (global as any).storage = storageInstance;

  // Setup session
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "monad-app-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === "production",
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          log(`Login failed: User ${username} not found`, "auth");
          return done(null, false, { message: "Invalid username or password" });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        
        if (!isPasswordValid) {
          log(`Login failed: Invalid password for ${username}`, "auth");
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Check if user is admin
        let isAdmin = false;
        if (storage.isAdmin) {
          isAdmin = await storage.isAdmin(user.id);
        }
        
        log(`Login successful: ${username} (admin: ${isAdmin})`, "auth");
        
        return done(null, {
          id: user.id,
          username: user.username,
          isAdmin,
        });
      } catch (error) {
        log(`Login error: ${error}`, "auth");
        return done(error);
      }
    })
  );

  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Check if user is admin
      let isAdmin = false;
      if (storage.isAdmin) {
        isAdmin = await storage.isAdmin(user.id);
      }
      
      done(null, {
        id: user.id,
        username: user.username,
        isAdmin,
      });
    } catch (error) {
      done(error, null);
    }
  });

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create new user
      const user = await storage.createUser({ username, password });
      
      // Log in the new user
      req.login(
        {
          id: user.id,
          username: user.username,
          isAdmin: false,
        },
        (err) => {
          if (err) {
            return next(err);
          }
          log(`Registered and logged in: ${username}`, "auth");
          return res.status(201).json({
            id: user.id,
            username: user.username,
            isAdmin: false,
          });
        }
      );
    } catch (error) {
      log(`Registration error: ${error}`, "auth");
      return res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    req.logout(() => {
      log(`Logged out: ${username}`, "auth");
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(req.user);
  });

  log("Auth setup complete", "auth");
}