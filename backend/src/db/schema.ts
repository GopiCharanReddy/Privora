import { integer, pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm';

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const rooms = pgTable("rooms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar().unique().notNull(),
  userId: integer('userId').references(() => users.id),
  isDeleted: boolean('deleted').notNull().default(false),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().$onUpdate(() => new Date())
});

export const messages = pgTable("messages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  message: varchar().notNull(),
  senderName: varchar({ length: 255 }).default("Anonymous"),
  roomId: integer('roomId').references(() => rooms.id),
  userId: integer('userId').references(() => users.id),
  isDeleted: boolean('deleted').notNull().default(false),
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().$onUpdate(() => new Date())
})

export const userRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  rooms: many(rooms)
}));

export const roomRelations = relations(rooms, ({ one, many }) => ({
  user: one(users, {
    fields: [rooms.userId],
    references: [users.id]
  }),
  messages: many(messages)
}));

export const messageRelations = relations(messages, ({ one }) => ({
  room: one(rooms, {
    fields: [messages.roomId],
    references: [rooms.id]
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id]
  })
}))