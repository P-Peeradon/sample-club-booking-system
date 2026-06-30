use rusqlite::{params, Connection, Result};
use std::sync::Mutex;
use tauri::State;
use serde::{Serialize, Deserialize};

pub struct DbState {
    pub conn: Mutex<Connection>,
}

#[derive(Serialize, Deserialize)]
pub struct Club {
    pub club_id: i32,
    pub name: String,
    pub desc: Option<String>,
    pub category: String,
    pub icon: String,
    pub is_approved: bool,
    pub is_rejected: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Member {
    pub student_id: String,
    pub is_president: bool,
}

pub fn init_db() -> Result<Connection> {
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

        CREATE TABLE IF NOT EXISTS darwin_chats (
            message_id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
            sender TEXT NOT NULL,
            is_anonymous INTEGER DEFAULT 0,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS advocacy_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
            request_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'Pending' NOT NULL,
            admin_response TEXT,
            resolved_by TEXT,
            revocation_reason TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS study_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            classroom TEXT NOT NULL,
            created_by TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workshops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            date DATETIME NOT NULL,
            created_by TEXT NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ")?;

    Ok(conn)
}

#[tauri::command]
pub fn get_stats(state: State<'_, DbState>) -> Result<(usize, usize), String> {
    let conn = state.conn.lock().unwrap();
    
    let mut stmt1 = conn.prepare("SELECT COUNT(*) FROM students").map_err(|e| e.to_string())?;
    let student_count: usize = stmt1.query_row([], |row| row.get(0)).unwrap_or(0);

    let mut stmt2 = conn.prepare("SELECT COUNT(*) FROM clubs").map_err(|e| e.to_string())?;
    let club_count: usize = stmt2.query_row([], |row| row.get(0)).unwrap_or(0);

    Ok((student_count, club_count))
}

#[tauri::command]
pub fn get_clubs(state: State<'_, DbState>) -> Result<Vec<Club>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT club_id, name, desc, category, icon, is_approved, is_rejected FROM clubs WHERE is_approved = 1").map_err(|e| e.to_string())?;
    
    let club_iter = stmt.query_map([], |row| {
        Ok(Club {
            club_id: row.get(0)?,
            name: row.get(1)?,
            desc: row.get(2)?,
            category: row.get(3)?,
            icon: row.get(4)?,
            is_approved: row.get(5)?,
            is_rejected: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut clubs = Vec::new();
    for club in club_iter {
        clubs.push(club.map_err(|e| e.to_string())?);
    }
    
    Ok(clubs)
}

#[tauri::command]
pub fn get_memberships(state: State<'_, DbState>, student_id: String) -> Result<Vec<i32>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT club_id FROM club_members WHERE student_id = ?").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([student_id], |row| row.get(0)).map_err(|e| e.to_string())?;

    let mut ids = Vec::new();
    for id in rows {
        ids.push(id.map_err(|e| e.to_string())?);
    }
    Ok(ids)
}

#[tauri::command]
pub fn get_club_members(state: State<'_, DbState>, club_id: i32) -> Result<Vec<Member>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT student_id, is_president FROM club_members WHERE club_id = ?").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([club_id], |row| {
        Ok(Member {
            student_id: row.get(0)?,
            is_president: row.get(1)?
        })
    }).map_err(|e| e.to_string())?;

    let mut members = Vec::new();
    for m in rows {
        members.push(m.map_err(|e| e.to_string())?);
    }
    Ok(members)
}

#[tauri::command]
pub fn toggle_club_membership(state: State<'_, DbState>, club_id: i32, student_id: String) -> Result<bool, String> {
    let conn = state.conn.lock().unwrap();
    
    // Check if member
    let mut stmt = conn.prepare("SELECT 1 FROM club_members WHERE club_id = ? AND student_id = ?").map_err(|e| e.to_string())?;
    let is_member = stmt.exists(rusqlite::params![club_id, student_id]).unwrap_or(false);

    if is_member {
        // Remove
        conn.execute("DELETE FROM club_members WHERE club_id = ? AND student_id = ?", rusqlite::params![club_id, student_id]).map_err(|e| e.to_string())?;
        Ok(false)
    } else {
        // Join
        conn.execute("INSERT INTO club_members (club_id, student_id, is_president) VALUES (?, ?, 0)", rusqlite::params![club_id, student_id]).map_err(|e| e.to_string())?;
        Ok(true)
    }
}

#[derive(Serialize)]
pub struct DarwinChat {
    pub message_id: i32,
    pub sender: String,
    pub message: String,
    pub created_at: String, // Keep as string for simple IPC
}

#[tauri::command]
pub fn get_darwin_chat_history(state: State<'_, DbState>, student_id: String) -> Result<Vec<DarwinChat>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT message_id, sender, message, CAST(created_at AS TEXT) FROM darwin_chats WHERE student_id = ? ORDER BY created_at ASC").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([student_id], |row| {
        Ok(DarwinChat {
            message_id: row.get(0)?,
            sender: row.get(1)?,
            message: row.get(2)?,
            created_at: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut chats = Vec::new();
    for c in rows {
        chats.push(c.map_err(|e| e.to_string())?);
    }
    Ok(chats)
}

#[tauri::command]
pub fn send_darwin_message(state: State<'_, DbState>, student_id: String, message: String, is_anonymous: bool) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("INSERT INTO darwin_chats (student_id, sender, message, is_anonymous) VALUES (?, 'Student', ?, ?)", 
                 rusqlite::params![student_id, message, if is_anonymous { 1 } else { 0 }]).map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Serialize)]
pub struct InboxItem {
    pub student_id: String,
    pub last_message: String,
}

#[tauri::command]
pub fn get_darwin_inbox_list(state: State<'_, DbState>) -> Result<Vec<InboxItem>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("
        SELECT student_id, message 
        FROM darwin_chats 
        WHERE message_id IN (
            SELECT MAX(message_id) 
            FROM darwin_chats 
            GROUP BY student_id
        )
    ").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([], |row| {
        Ok(InboxItem {
            student_id: row.get(0)?,
            last_message: row.get(1)?
        })
    }).map_err(|e| e.to_string())?;

    let mut items = Vec::new();
    for i in rows {
        items.push(i.map_err(|e| e.to_string())?);
    }
    Ok(items)
}

#[tauri::command]
pub fn get_pending_clubs(state: State<'_, DbState>) -> Result<Vec<Club>, String> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare("SELECT club_id, name, desc, category, icon, is_approved, is_rejected FROM clubs WHERE is_approved = 0 AND is_rejected = 0").map_err(|e| e.to_string())?;
    
    let club_iter = stmt.query_map([], |row| {
        Ok(Club {
            club_id: row.get(0)?,
            name: row.get(1)?,
            desc: row.get(2)?,
            category: row.get(3)?,
            icon: row.get(4)?,
            is_approved: row.get(5)?,
            is_rejected: row.get(6)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut clubs = Vec::new();
    for club in club_iter {
        clubs.push(club.map_err(|e| e.to_string())?);
    }
    Ok(clubs)
}

#[tauri::command]
pub fn approve_club(state: State<'_, DbState>, club_id: i32) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE clubs SET is_approved = 1 WHERE club_id = ?", rusqlite::params![club_id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn reject_club(state: State<'_, DbState>, club_id: i32, reason: String) -> Result<(), String> {
    let conn = state.conn.lock().unwrap();
    conn.execute("UPDATE clubs SET is_rejected = 1, rejection_reason = ? WHERE club_id = ?", rusqlite::params![reason, club_id]).map_err(|e| e.to_string())?;
    Ok(())
}
