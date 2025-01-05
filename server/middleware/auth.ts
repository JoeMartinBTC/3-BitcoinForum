
import { Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    replitUserId: string;
    replitUsername: string;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const replitUserId = req.headers["x-replit-user-id"];
  const replitUsername = req.headers["x-replit-user-name"];
  
  if (!replitUserId || !replitUsername) {
    req.user = null;
    return next();
  }

  const existingUser = await db.select().from(users).where(eq(users.replitUserId, replitUserId.toString())).limit(1);
  
  if (existingUser.length === 0) {
    // Create new user with viewer role
    const [newUser] = await db.insert(users).values({
      email: `${replitUsername}@replit.user`,
      role: "viewer",
      replitUserId: replitUserId.toString(),
      replitUsername: replitUsername.toString()
    }).returning();
    req.user = newUser;
  } else {
    req.user = existingUser[0];
  }
  
  next();
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
