import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import { db } from '../db/setup.ts';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from '../db/schema.ts';

interface customJwtPayload extends JwtPayload {
  _id: string
}

export type User = InferSelectModel<typeof users>;

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const verifyJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.split(' ')[1];

    if (!token || typeof token !== 'string') {
      return res.status(401).json({
        error: "Unauthorized token"
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as customJwtPayload;

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, Number(decodedToken._id))
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found."
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Server error: ', error);
    return res.status(500).json({
      error: 'Unexpected Server Error. Try again later'
    });
  }
}