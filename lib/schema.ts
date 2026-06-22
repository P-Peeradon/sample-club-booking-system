import { mysqlTable, int, varchar, text, timestamp, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  student_id: varchar('student_id', { length: 50 }).notNull().unique(),
  year: int('year').notNull(),
  room: varchar('room', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const clubs = mysqlTable('clubs', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const clubMembers = mysqlTable('club_members', {
  user_id: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  club_id: int('club_id').notNull().references(() => clubs.id, { onDelete: 'cascade' }),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user_id, table.club_id] }),
  };
});

// Relations for easier querying with Drizzle
export const usersRelations = relations(users, ({ many }) => ({
  clubMembers: many(clubMembers),
}));

export const clubsRelations = relations(clubs, ({ many }) => ({
  clubMembers: many(clubMembers),
}));

export const clubMembersRelations = relations(clubMembers, ({ one }) => ({
  user: one(users, {
    fields: [clubMembers.user_id],
    references: [users.id],
  }),
  club: one(clubs, {
    fields: [clubMembers.club_id],
    references: [clubs.id],
  }),
}));
