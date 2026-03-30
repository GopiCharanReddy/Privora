import type { Request, Response } from "express";
import { db } from "../db/setup.ts";
import { nanoid } from "nanoid";
import { rooms } from "../db/schema.ts";

export const createRoom = async (req: Request, res: Response) => {
  const { user } = req.body;

  if (!user) {
    return res.status(401).json({
      error: "Username cannot be empty."
    })
  }
  const slug = nanoid();
  try {

    await db.insert(rooms).values({
      slug: slug,
    }).returning({ insertedId: rooms.id })

    if (!slug) {
      return res.status(500).json({
        error: "Unable to create room. Please try again later."
      });
    }

    return res.status(200).json({
      message: "Room created successfully.",
      slug
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      error: "Error while creating Room. Please try again later."
    });
  }
}

export const joinRoom = async (req: Request, res: Response) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(401).json({
      error: "Room id is required."
    })
  }

  try {
    const existingSlug = await db.query.rooms.findFirst({
      where: (rooms, { eq }) => eq(rooms.slug, slug)
    });

    if (!existingSlug) {
      return res.status(401).json({
        error: "Room not found."
      })
    }

    return res.status(200).json({
      message: "Joined room."
    });
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({
      error: "Error while joining Room. Please try again later."
    })
  }
}