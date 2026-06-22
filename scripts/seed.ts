import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  console.log('Starting Elmore High database seeding...');

  // Setup database connection config
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_DATABASE || 'elmore_stop_two';

  console.log(`Connecting to MySQL server at ${host}:${port} as user '${user}'...`);

  // Create temporary connection to create database if not exists
  let connection: mysql.Connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
  } catch (error: any) {
    console.error('Failed to connect to MySQL server. Please make sure MySQL is running and your credentials in .env.local are correct.');
    console.error(error.message);
    process.exit(1);
  }

  // Create database
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

  // Connect to the specific database
  const db = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  console.log(`Using database '${database}'`);

  // Create tables
  console.log('Creating tables...');
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      student_id VARCHAR(50) UNIQUE NOT NULL,
      year INT NOT NULL,
      room VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS club_members (
      user_id INT,
      club_id INT,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, club_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE
    );
  `);

  // Clear existing data to allow re-seeding
  console.log('Clearing old data...');
  await db.query('SET FOREIGN_KEY_CHECKS = 0;');
  await db.query('TRUNCATE TABLE club_members;');
  await db.query('TRUNCATE TABLE clubs;');
  await db.query('TRUNCATE TABLE users;');
  await db.query('SET FOREIGN_KEY_CHECKS = 1;');

  // Insert clubs
  console.log('Inserting clubs...');
  const clubs = [
    { name: 'The Cheerleaders', category: 'Athletics', icon: '📣', description: 'Led by Penny Fitzgerald, bringing school spirit and shape-shifting energy!' },
    { name: 'The Nerds', category: 'Academic', icon: '🔬', description: 'The Rainbow Factory regulars. Science, math, and general robot calibration.' },
    { name: 'Elmore High Band', category: 'Music', icon: '🎵', description: 'Playing the triangles, recorders, and cassettes. Strictly out of tune!' },
    { name: 'The Treehouse Club', category: 'Social', icon: '🌳', description: "Gumball and Darwin's secret hangout. Strictly no girls allowed (unless they bring cookies)." },
    { name: 'The Art Club', category: 'Creative', icon: '🎨', description: 'Expressing our weirdest emotions through abstract paintings and papier-mâché.' },
    { name: 'The Jocks', category: 'Athletics', icon: '🏋️', description: 'Led by Jamie Russo. We lift heavy lockers and run fast!' },
  ];

  const clubIds: { [name: string]: number } = {};
  for (const c of clubs) {
    const [result]: any = await db.query(
      'INSERT INTO clubs (name, category, icon, description) VALUES (?, ?, ?, ?)',
      [c.name, c.category, c.icon, c.description]
    );
    clubIds[c.name] = result.insertId;
  }

  // Insert students
  console.log('Inserting students...');
  const salt = await bcrypt.genSalt(10);
  const students = [
    { name: 'Gumball Watterson', student_id: 'EH-2024001', year: 2, room: '12B', email: 'gumball@elmore.edu', password: 'locker-gumball', avatar: 'gumball' },
    { name: 'Darwin Watterson', student_id: 'EH-2024002', year: 2, room: '12B', email: 'darwin@elmore.edu', password: 'locker-darwin', avatar: 'darwin' },
    { name: 'Anais Watterson', student_id: 'EH-2024003', year: 1, room: '10A', email: 'anais@elmore.edu', password: 'locker-anais', avatar: 'anais' },
    { name: 'Penny Fitzgerald', student_id: 'EH-2024004', year: 2, room: '12B', email: 'penny@elmore.edu', password: 'locker-penny', avatar: 'penny' },
    { name: 'Carrie Krueger', student_id: 'EH-2024005', year: 2, room: '12B', email: 'carrie@elmore.edu', password: 'locker-carrie', avatar: 'carrie' },
    { name: 'Bobert', student_id: 'EH-2024006', year: 2, room: '12C', email: 'bobert@elmore.edu', password: 'locker-bobert', avatar: 'bobert' },
    { name: 'Banana Joe', student_id: 'EH-2024007', year: 2, room: '12B', email: 'banana@elmore.edu', password: 'locker-banana', avatar: 'banana' },
  ];

  const studentIds: { [name: string]: number } = {};
  for (const s of students) {
    const hashedPassword = await bcrypt.hash(s.password, salt);
    const [result]: any = await db.query(
      'INSERT INTO users (name, student_id, year, room, email, password, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [s.name, s.student_id, s.year, s.room, s.email, hashedPassword, s.avatar]
    );
    studentIds[s.name] = result.insertId;
  }

  // Insert club memberships
  console.log('Inserting memberships...');
  const memberships = [
    { student: 'Gumball Watterson', club: 'Elmore High Band' },
    { student: 'Gumball Watterson', club: 'The Treehouse Club' },
    { student: 'Darwin Watterson', club: 'Elmore High Band' },
    { student: 'Darwin Watterson', club: 'The Treehouse Club' },
    { student: 'Penny Fitzgerald', club: 'The Cheerleaders' },
    { student: 'Penny Fitzgerald', club: 'The Art Club' },
    { student: 'Carrie Krueger', club: 'Elmore High Band' },
    { student: 'Anais Watterson', club: 'The Nerds' },
    { student: 'Bobert', club: 'The Nerds' },
    { student: 'Banana Joe', club: 'The Treehouse Club' },
  ];

  for (const m of memberships) {
    const userId = studentIds[m.student];
    const clubId = clubIds[m.club];
    if (userId && clubId) {
      await db.query(
        'INSERT INTO club_members (user_id, club_id) VALUES (?, ?)',
        [userId, clubId]
      );
    }
  }

  await db.end();
  console.log('Database seeding successfully completed!');
}

seed().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});
