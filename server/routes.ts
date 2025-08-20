import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { users, userRoles, products, wishlist, orders, orderItems } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, full_name } = req.body;
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const newUser = await db.insert(users).values({
        email,
        password: hashedPassword,
        full_name: full_name || null
      }).returning();
      
      // Create user role
      await db.insert(userRoles).values({
        user_id: newUser[0].id,
        role: 'user'
      });
      
      const token = jwt.sign({ userId: newUser[0].id, email: newUser[0].email }, JWT_SECRET);
      
      res.json({ user: { id: newUser[0].id, email: newUser[0].email, full_name: newUser[0].full_name }, token });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (user.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const validPassword = await bcrypt.compare(password, user[0].password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET);
      
      res.json({ user: { id: user[0].id, email: user[0].email, full_name: user[0].full_name }, token });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Get user profile
  app.get('/api/auth/profile', authenticateToken, async (req: any, res) => {
    try {
      const user = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if user is admin
      const adminRole = await db.select().from(userRoles).where(
        and(eq(userRoles.user_id, req.user.userId), eq(userRoles.role, 'admin'))
      ).limit(1);
      
      res.json({ 
        ...user[0], 
        password: undefined,
        isAdmin: adminRole.length > 0 
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Update user profile
  app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
    try {
      const { full_name } = req.body;
      
      await db.update(users)
        .set({ full_name, updated_at: new Date() })
        .where(eq(users.id, req.user.userId));
      
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Admin setup route - creates first admin user
  app.post('/api/auth/setup-admin', async (req, res) => {
    try {
      const { email, password, full_name } = req.body;
      
      // Check if any admin users already exist
      const existingAdmin = await db.select().from(userRoles).where(eq(userRoles.role, 'admin')).limit(1);
      if (existingAdmin.length > 0) {
        return res.status(400).json({ error: 'Admin user already exists' });
      }
      
      // Check if user exists
      let user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (user.length === 0) {
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await db.insert(users).values({
          email,
          password: hashedPassword,
          full_name: full_name || null
        }).returning();
      }
      
      // Make user admin
      await db.insert(userRoles).values({
        user_id: user[0].id,
        role: 'admin'
      });
      
      const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET);
      
      res.json({ 
        user: { id: user[0].id, email: user[0].email, full_name: user[0].full_name }, 
        token,
        message: 'Admin user created successfully' 
      });
    } catch (error) {
      console.error('Admin setup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Products routes
  app.get('/api/products', async (req, res) => {
    try {
      const allProducts = await db.select().from(products).where(eq(products.in_stock, true)).orderBy(desc(products.created_at));
      res.json(allProducts);
    } catch (error) {
      console.error('Products fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Admin: Create product
  app.post('/api/products', authenticateToken, async (req: any, res) => {
    try {
      // Check if user is admin
      const adminRole = await db.select().from(userRoles).where(
        and(eq(userRoles.user_id, req.user.userId), eq(userRoles.role, 'admin'))
      ).limit(1);
      
      if (adminRole.length === 0) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const productData = req.body;
      const newProduct = await db.insert(products).values(productData).returning();
      
      res.json(newProduct[0]);
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Admin: Delete product
  app.delete('/api/products/:id', authenticateToken, async (req: any, res) => {
    try {
      // Check if user is admin
      const adminRole = await db.select().from(userRoles).where(
        and(eq(userRoles.user_id, req.user.userId), eq(userRoles.role, 'admin'))
      ).limit(1);
      
      if (adminRole.length === 0) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      await db.delete(products).where(eq(products.id, req.params.id));
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Product deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Wishlist routes
  app.get('/api/wishlist', authenticateToken, async (req: any, res) => {
    try {
      const wishlistItems = await db.select({
        id: wishlist.id,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          original_price: products.original_price,
          image_url: products.image_url,
          colors: products.colors,
          in_stock: products.in_stock,
          is_on_sale: products.is_on_sale,
          category: products.category,
          gender: products.gender,
          description: products.description
        }
      })
      .from(wishlist)
      .innerJoin(products, eq(wishlist.product_id, products.id))
      .where(eq(wishlist.user_id, req.user.userId));
      
      res.json(wishlistItems);
    } catch (error) {
      console.error('Wishlist fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/wishlist', authenticateToken, async (req: any, res) => {
    try {
      const { product_id } = req.body;
      
      // Check if already in wishlist
      const existing = await db.select().from(wishlist).where(
        and(eq(wishlist.user_id, req.user.userId), eq(wishlist.product_id, product_id))
      ).limit(1);
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Product already in wishlist' });
      }
      
      const newWishlistItem = await db.insert(wishlist).values({
        user_id: req.user.userId,
        product_id
      }).returning();
      
      res.json(newWishlistItem[0]);
    } catch (error) {
      console.error('Wishlist add error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.delete('/api/wishlist/:id', authenticateToken, async (req: any, res) => {
    try {
      await db.delete(wishlist).where(
        and(eq(wishlist.id, req.params.id), eq(wishlist.user_id, req.user.userId))
      );
      
      res.json({ message: 'Item removed from wishlist' });
    } catch (error) {
      console.error('Wishlist remove error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Orders routes
  app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const userOrders = await db.select().from(orders)
        .where(eq(orders.user_id, req.user.userId))
        .orderBy(desc(orders.created_at))
        .limit(10);
      
      res.json(userOrders);
    } catch (error) {
      console.error('Orders fetch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const { total_amount, items, payment_id } = req.body;
      
      // Create order
      const newOrder = await db.insert(orders).values({
        user_id: req.user.userId,
        total_amount,
        payment_id,
        status: 'completed'
      }).returning();
      
      // Create order items
      for (const item of items) {
        await db.insert(orderItems).values({
          order_id: newOrder[0].id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          selected_color: item.selected_color,
          selected_size: item.selected_size
        });
      }
      
      res.json(newOrder[0]);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
