import { mysqlTable, int, varchar, text, timestamp, primaryKey, mysqlEnum, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  uid: int('uid').autoincrement().primaryKey(),
  full_name: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const sessions = mysqlTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  uid: int('uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  expires_at: timestamp('expires_at').notNull(),
});

export const students = mysqlTable('students', {
  uid: int('uid').primaryKey().references(() => users.uid, { onDelete: 'cascade' }),
  student_id: varchar('student_id', { length: 50 }).notNull().unique(),
  institute: varchar('institute', { length: 255 }).notNull(),
  year: int('year').notNull(),
  room: varchar('room', { length: 50 }).notNull(),
});

export const clubs = mysqlTable('clubs', {
  club_id: int('club_id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  desc: text('description'),
  category: mysqlEnum('category', ['Education', 'Treehouse', 'Sport', 'Music', 'Politics']).notNull(),
  icon: varchar('icon', { length: 255 }).notNull(),
  is_approved: boolean('is_approved').default(false).notNull(),
  is_rejected: boolean('is_rejected').default(false).notNull(),
  rejection_reason: text('rejection_reason'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const clubMembers = mysqlTable('club_members', {
  student_id: varchar('student_id', { length: 50 }).notNull().references(() => students.student_id, { onDelete: 'cascade' }),
  club_id: int('club_id').notNull().references(() => clubs.club_id, { onDelete: 'cascade' }),
  is_president: boolean('is_president').default(false).notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.student_id, table.club_id] }),
  };
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students),
  sessions: many(sessions),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.uid],
    references: [users.uid],
  }),
  clubMembers: many(clubMembers),
  darwinChats: many(darwinChats),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.uid],
    references: [users.uid],
  }),
}));

export const clubsRelations = relations(clubs, ({ many }) => ({
  clubMembers: many(clubMembers),
}));

export const clubMembersRelations = relations(clubMembers, ({ one }) => ({
  student: one(students, {
    fields: [clubMembers.student_id],
    references: [students.student_id],
  }),
  club: one(clubs, {
    fields: [clubMembers.club_id],
    references: [clubs.club_id],
  }),
}));

export const darwinChats = mysqlTable('darwin_chats', {
  message_id: int('message_id').autoincrement().primaryKey(),
  student_id: varchar('student_id', { length: 50 }).notNull().references(() => students.student_id, { onDelete: 'cascade' }),
  sender: mysqlEnum('sender', ['Student', 'Darwin', 'Gumball']).notNull(),
  is_anonymous: int('is_anonymous').default(0).notNull(), // 0=false, 1=true
  message: text('message').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const darwinChatsRelations = relations(darwinChats, ({ one }) => ({
  student: one(students, {
    fields: [darwinChats.student_id],
    references: [students.student_id],
  }),
}));
