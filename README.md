# Elmore High School Club Membership Portal

Welcome to the **Elmore High School Club Membership Portal**! Inspired by *The Amazing World of Gumball*, this is a full-stack web application built for Elmore students to enroll, access their digital lockers, and join the wackiest clubs in school.

## Features

- **Cartoon-Themed UI:** A playful, vibrant, and nostalgic design system using Tailwind CSS.
- **Student Enrollment:** Register as a student using an official Elmore Student ID (format: `EH-YYYYXXX`).
- **Database-Backed Sessions:** Secure, stateful session management.
- **Club Directory:** Browse the latest clubs around school (Athletics, Academics, Music, and more).
- **Interactive Dashboards:** Join and leave clubs, view current member rosters, and manage your locker.

## Tech Stack

- **Framework:** Next.js (App Router, Server Actions)
- **Styling:** Tailwind CSS (Custom themes, custom fonts, cartoon aesthetics)
- **Database ORM:** Drizzle ORM
- **Database:** MySQL
- **Validation:** Zod
- **Authentication:** bcryptjs for password hashing, stateful session tokens.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Bun (recommended) or npm/yarn/pnpm
- A running MySQL instance

### Installation & Setup

1. **Clone the repository and install dependencies:**
   ```bash
   bun install
   ```

2. **Database Configuration:**
   Ensure your MySQL server is running. Create a new user `elmore_student_union` for the app (do not use root in production!).
   Rename `.env.example` to `.env.local` (or create one) and configure your database variables:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=elmore_student_union
   DB_PASSWORD=your_secure_password
   DB_DATABASE=elmore_stop_two
   ```

3. **Seed the Database:**
   Run the setup script to drop existing tables, migrate the new Drizzle schema, and populate Elmore High with some familiar faces (Gumball, Darwin, Penny, etc.) and clubs:
   ```bash
   bun run scripts/seed.ts
   ```

4. **Run the Development Server:**
   ```bash
   bun run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema Highlights

The backend runs on a highly normalized relational schema:
- `users`: Core authentication data and avatars.
- `students`: Academic profile tied directly to a user.
- `sessions`: Secure stateful tracking of active lockers.
- `clubs`: Club details and category enums.
- `club_members`: Junction table tracking which students are in which clubs.

## Contributing

Principal Brown strictly forbids running in the hallways, but contributions are always welcome. Feel free to open an issue or submit a pull request!
