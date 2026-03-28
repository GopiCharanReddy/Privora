import { type Request, type Response } from "express"
import { db } from "../db/setup.ts";
import { nanoid } from "nanoid";
import { users } from "../db/schema.ts";

export const userInfo = async (req: Request, res: Response) => {
  const { user } = req.body;
  if (!user) {
    res.status(401).json({
      error: "Username cannot be null."
    });
  }

  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, 1),
  });
  if (existingUser) {
    return res.status(409).json({
      error: "User already exists."
    })
  }

  const username = user + nanoid();

  await db.insert(users).values({
    name: username,
  }).returning({ insertedId: users.id });

  return res.status(200).json({
    message: "User created successfully."
  })
}