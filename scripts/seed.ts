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

  // Connect to the specific database
  let db: mysql.Connection;
  try {
    db = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });
  } catch (error: any) {
    console.error('Failed to connect to MySQL server. Please make sure MySQL is running and your credentials in .env.local are correct.');
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Using database '${database}'`);

  // Clear existing data to allow re-seeding
  console.log('Clearing old data and recreating tables...');
  await db.query('SET FOREIGN_KEY_CHECKS = 0;');
  await db.query('DROP TABLE IF EXISTS club_members;');
  await db.query('DROP TABLE IF EXISTS clubs;');
  await db.query('DROP TABLE IF EXISTS students;');
  await db.query('DROP TABLE IF EXISTS sessions;');
  await db.query('DROP TABLE IF EXISTS users;');
  
  // Create tables
  await db.query(`
    CREATE TABLE users (
      uid INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE sessions (
      id VARCHAR(255) PRIMARY KEY,
      uid INT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
    );
  `);

  await db.query(`
    CREATE TABLE students (
      uid INT PRIMARY KEY,
      student_id VARCHAR(50) UNIQUE NOT NULL,
      institute VARCHAR(255) NOT NULL,
      year INT NOT NULL,
      room VARCHAR(50) NOT NULL,
      FOREIGN KEY (uid) REFERENCES users(uid) ON DELETE CASCADE
    );
  `);

  await db.query(`
    CREATE TABLE clubs (
      club_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      \`desc\` TEXT,
      category ENUM('Education', 'Treehouse', 'Sport', 'Music', 'Politics') NOT NULL,
      icon VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE club_members (
      student_id VARCHAR(50) NOT NULL,
      club_id INT NOT NULL,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, club_id),
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
      FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE
    );
  `);
  
  await db.query('SET FOREIGN_KEY_CHECKS = 1;');

  // Insert clubs
  console.log('Inserting clubs...');
  const clubData = [
    { name: 'The Cheerleaders', category: 'Sport', icon: '📣', desc: 'Led by Penny Fitzgerald, bringing school spirit and shape-shifting energy!' },
    { name: 'The Nerds', category: 'Education', icon: '🔬', desc: 'The Rainbow Factory regulars. Science, math, and general robot calibration.' },
    { name: 'Elmore High Band', category: 'Music', icon: '🎵', desc: 'Playing the triangles, recorders, and cassettes. Strictly out of tune!' },
    { name: 'The Treehouse Club', category: 'Treehouse', icon: '🌳', desc: "Gumball and Darwin's secret hangout. Strictly no girls allowed (unless they bring cookies)." },
    { name: 'The Art Club', category: 'Education', icon: '🎨', desc: 'Expressing our weirdest emotions through abstract paintings and papier-mâché.' },
    { name: 'The Jocks', category: 'Sport', icon: '🏋️', desc: 'Led by Rocky Robinson. We lift heavy lockers and run fast!' },
  ];

  const clubIds: { [name: string]: number } = {};
  for (const c of clubData) {
    const [result]: any = await db.query(
      'INSERT INTO clubs (name, category, icon, `desc`) VALUES (?, ?, ?, ?)',
      [c.name, c.category, c.icon, c.desc]
    );
    clubIds[c.name] = result.insertId;
  }

  // Insert students
  console.log('Inserting students...');
  const salt = await bcrypt.genSalt(10);
  const studentData = [
    { name: 'Gumball Watterson', student_id: 'EH-2024001', year: 2, room: '12B', email: 'gumball@elmore.edu', password: 'locker-gumball', avatar: 'gumball' },
    { name: 'Darwin Watterson', student_id: 'EH-2024002', year: 2, room: '12B', email: 'darwin@elmore.edu', password: 'locker-darwin', avatar: 'darwin' },
    { name: 'Anais Watterson', student_id: 'EH-2024003', year: 1, room: '10A', email: 'anais@elmore.edu', password: 'locker-anais', avatar: 'anais' },
    { name: 'Penny Fitzgerald', student_id: 'EH-2024004', year: 2, room: '12B', email: 'penny@elmore.edu', password: 'locker-penny', avatar: 'penny' },
    { name: 'Carrie Krueger', student_id: 'EH-2024005', year: 2, room: '12B', email: 'carrie@elmore.edu', password: 'locker-carrie', avatar: 'carrie' },
    { name: 'Bobert', student_id: 'EH-2024006', year: 2, room: '12C', email: 'bobert@elmore.edu', password: 'locker-bobert', avatar: 'bobert' },
    { name: 'Banana Joe', student_id: 'EH-2024007', year: 2, room: '12B', email: 'banana@elmore.edu', password: 'locker-banana', avatar: 'banana' },
  ];

  const studentIdMap: { [name: string]: string } = {};
  for (const s of studentData) {
    const hashedPassword = await bcrypt.hash(s.password, salt);
    
    // Insert into users
    const [userResult]: any = await db.query(
      'INSERT INTO users (full_name, email, password, avatar) VALUES (?, ?, ?, ?)',
      [s.name, s.email, hashedPassword, s.avatar]
    );
    const newUid = userResult.insertId;

    // Insert into students
    await db.query(
      'INSERT INTO students (uid, student_id, institute, year, room) VALUES (?, ?, ?, ?, ?)',
      [newUid, s.student_id, 'Elmore High School', s.year, s.room]
    );

    studentIdMap[s.name] = s.student_id;
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
    const sId = studentIdMap[m.student];
    const cId = clubIds[m.club];
    if (sId && cId) {
      await db.query(
        'INSERT INTO club_members (student_id, club_id) VALUES (?, ?)',
        [sId, cId]
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
