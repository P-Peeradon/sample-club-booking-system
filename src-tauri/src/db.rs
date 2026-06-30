use rusqlite::{params, Connection, Result};
use std::sync::Mutex;
use tauri::State;

pub struct DbState {
    pub conn: Mutex<Connection>,
}

pub fn init_db() -> Result<Connection> {
    // In a real app, use a path in app_data_dir, but for now we'll use a local file
    let conn = Connection::open("elmore_spoke.db")?;

    // Mirroring the Hub MySQL schema into local SQLite Spoke
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS users (
            uid INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            avatar TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS students (
            uid INTEGER PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
            student_id TEXT NOT NULL UNIQUE,
            institute TEXT NOT NULL,
            year INTEGER NOT NULL,
            room TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS clubs (
            club_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            desc TEXT,
            category TEXT NOT NULL,
            icon TEXT NOT NULL,
            is_approved BOOLEAN DEFAULT 0,
            is_rejected BOOLEAN DEFAULT 0,
            rejection_reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS club_members (
            student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
            club_id INTEGER NOT NULL REFERENCES clubs(club_id) ON DELETE CASCADE,
            is_president BOOLEAN DEFAULT 0,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (student_id, club_id)
        );
    ")?;

    Ok(conn)
}

// Example Tauri command to interact with the database
#[tauri::command]
pub fn get_stats(state: State<'_, DbState>) -> Result<(usize, usize), String> {
    let conn = state.conn.lock().unwrap();
    
    let mut stmt1 = conn.prepare("SELECT COUNT(*) FROM students").map_err(|e| e.to_string())?;
    let student_count: usize = stmt1.query_row([], |row| row.get(0)).unwrap_or(0);

    let mut stmt2 = conn.prepare("SELECT COUNT(*) FROM clubs").map_err(|e| e.to_string())?;
    let club_count: usize = stmt2.query_row([], |row| row.get(0)).unwrap_or(0);

    Ok((student_count, club_count))
}
