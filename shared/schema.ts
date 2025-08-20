import { pgTable, text, serial, integer, boolean, decimal, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  full_name: text("full_name"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// User roles table
export const userRoles = pgTable("user_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("user"), // 'admin' or 'user'
  created_at: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  original_price: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  gender: text("gender").notNull(),
  colors: text("colors").array(),
  sizes: text("sizes").array(),
  image_url: text("image_url"),
  in_stock: boolean("in_stock").default(true),
  is_on_sale: boolean("is_on_sale").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Wishlist table
export const wishlist = pgTable("wishlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  product_id: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  payment_id: text("payment_id"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  order_id: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  product_id: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  selected_color: text("selected_color"),
  selected_size: text("selected_size"),
  created_at: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  full_name: true,
});

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertOrderSchema = createInsertSchema(orders);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertWishlistSchema = createInsertSchema(wishlist);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type WishlistItem = typeof wishlist.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistSchema>;
