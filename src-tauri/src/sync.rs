use mysql::prelude::*;
use mysql::*;
use rusqlite::Connection;
use std::thread;
use std::time::Duration;
use std::env;
use dotenv::dotenv;

pub fn start_sync_loop() {
    thread::spawn(move || {
        loop {
            if let Err(e) = perform_sync() {
                eprintln!("Hub-Spoke Sync error: {}", e);
            } else {
                println!("Hub-Spoke Sync successful!");
            }
            thread::sleep(Duration::from_secs(60)); // Sync every 60 seconds
        }
    });
}

fn perform_sync() -> std::result::Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    dotenv::from_filename("../.env.local").ok(); 
    
    let db_host = env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string());
    let db_port = env::var("DB_PORT").unwrap_or_else(|_| "3306".to_string());
    let db_user = env::var("DB_USER").unwrap_or_else(|_| "elmore_student_union".to_string());
    let db_pass = env::var("DB_PASSWORD").unwrap_or_else(|_| "".to_string());
    let db_name = env::var("DB_DATABASE").unwrap_or_else(|_| "elmore_stop_two".to_string());

    let url = format!("mysql://{}:{}@{}:{}/{}", db_user, db_pass, db_host, db_port, db_name);
    
    let pool = Pool::new(url.as_str())?;
    let mut hub_conn = pool.get_conn()?;
    let mut spoke_conn = Connection::open("elmore_spoke.db")?;

    // Turn off foreign keys temporarily during bulk sync to avoid constraint errors on insert order
    spoke_conn.execute("PRAGMA foreign_keys = OFF;", [])?;

    sync_users(&mut hub_conn, &mut spoke_conn)?;
    sync_students(&mut hub_conn, &mut spoke_conn)?;
    sync_clubs(&mut hub_conn, &mut spoke_conn)?;
    sync_club_members(&mut hub_conn, &mut spoke_conn)?;
    sync_darwin_chats(&mut hub_conn, &mut spoke_conn)?;
    sync_advocacy_requests(&mut hub_conn, &mut spoke_conn)?;
    sync_study_groups(&mut hub_conn, &mut spoke_conn)?;
    sync_workshops(&mut hub_conn, &mut spoke_conn)?;

    spoke_conn.execute("PRAGMA foreign_keys = ON;", [])?;
    Ok(())
}

fn sync_users(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let users: Vec<(i32, String, String, String, String)> = hub.query("
        SELECT uid, full_name, email, password, avatar FROM users
    ")?;

    let tx = spoke.transaction()?;
    for (uid, full_name, email, password, avatar) in users {
        tx.execute("
            INSERT INTO users (uid, full_name, email, password, avatar) 
            VALUES (?1, ?2, ?3, ?4, ?5)
            ON CONFLICT(uid) DO UPDATE SET 
            full_name = excluded.full_name,
            email = excluded.email,
            password = excluded.password,
            avatar = excluded.avatar
        ", rusqlite::params![uid, full_name, email, password, avatar])?;
    }
    tx.commit()?;
    Ok(())
}

fn sync_students(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let students: Vec<(i32, String, String, i32, String)> = hub.query("
        SELECT uid, student_id, institute, year, room FROM students
    ")?;

    let tx = spoke.transaction()?;
    for (uid, student_id, institute, year, room) in students {
        tx.execute("
            INSERT INTO students (uid, student_id, institute, year, room) 
            VALUES (?1, ?2, ?3, ?4, ?5)
            ON CONFLICT(uid) DO UPDATE SET 
            student_id = excluded.student_id,
            institute = excluded.institute,
            year = excluded.year,
            room = excluded.room
        ", rusqlite::params![uid, student_id, institute, year, room])?;
    }
    tx.commit()?;
    Ok(())
}

fn sync_clubs(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let clubs: Vec<(i32, String, Option<String>, String, String, bool, bool)> = hub.query("
        SELECT club_id, name, `desc`, category, icon, is_approved, is_rejected FROM clubs
    ")?;

    let tx = spoke.transaction()?;
    for (club_id, name, desc, category, icon, is_approved, is_rejected) in clubs {
        tx.execute("
            INSERT INTO clubs (club_id, name, desc, category, icon, is_approved, is_rejected) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            ON CONFLICT(club_id) DO UPDATE SET 
            name = excluded.name,
            desc = excluded.desc,
            category = excluded.category,
            icon = excluded.icon,
            is_approved = excluded.is_approved,
            is_rejected = excluded.is_rejected
        ", rusqlite::params![club_id, name, desc, category, icon, is_approved, is_rejected])?;
    }
    tx.commit()?;
    Ok(())
}

fn sync_club_members(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let members: Vec<(String, i32, bool)> = hub.query("
        SELECT student_id, club_id, is_president FROM club_members
    ")?;

    let tx = spoke.transaction()?;
    for (student_id, club_id, is_president) in members {
        tx.execute("
            INSERT INTO club_members (student_id, club_id, is_president) 
            VALUES (?1, ?2, ?3)
            ON CONFLICT(student_id, club_id) DO UPDATE SET 
            is_president = excluded.is_president
        ", rusqlite::params![student_id, club_id, is_president])?;
    }
    tx.commit()?;
    Ok(())
}

fn sync_darwin_chats(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let chats: Vec<(i32, String, String, i32, String)> = hub.query("
        SELECT message_id, student_id, sender, is_anonymous, message FROM darwin_chats
    ")?;

    let tx = spoke.transaction()?;
    for (message_id, student_id, sender, is_anonymous, message) in chats {
        tx.execute("
            INSERT INTO darwin_chats (message_id, student_id, sender, is_anonymous, message) 
            VALUES (?1, ?2, ?3, ?4, ?5)
            ON CONFLICT(message_id) DO UPDATE SET 
            student_id = excluded.student_id,
            sender = excluded.sender,
            is_anonymous = excluded.is_anonymous,
            message = excluded.message
        ", rusqlite::params![message_id, student_id, sender, is_anonymous, message])?;
    }
    tx.commit()?;
    Ok(())
}

fn sync_advocacy_requests(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let requests: Vec<(i32, String, String, String, String, String, Option<String>, Option<String>, Option<String>)> = hub.query("
        SELECT id, student_id, request_type, title, description, status, admin_response, resolved_by, revocation_reason FROM advocacy_requests
    ")?;

    let tx = spoke.transaction()?;
    for (id, student_id, request_type, title, description, status, admin_response, resolved_by, revocation_reason) in requests {
        tx.execute("
            INSERT INTO advocacy_requests (id, student_id, request_type, title, description, status, admin_response, resolved_by, revocation_reason) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            ON CONFLICT(id) DO UPDATE SET 
            student_id = excluded.student_id,
            request_type = excluded.request_type,
            title = excluded.title,
            description = excluded.description,
            status = excluded.status,
            admin_response = excluded.admin_response,
            resolved_by = excluded.resolved_by,
            revocation_reason = excluded.revocation_reason
        ", rusqlite::params![id, student_id, request_type, title, description, status, admin_response, resolved_by, revocation_reason])?;
    }
    tx.commit()?;
    Ok(())
}

fn sync_study_groups(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    let groups: Vec<(i32, String, String, String, String)> = hub.query("
        SELECT id, name, subject, classroom, created_by FROM study_groups
    ")?;

    let tx = spoke.transaction()?;
    for (id, name, subject, classroom, created_by) in groups {
        tx.execute("
            INSERT INTO study_groups (id, name, subject, classroom, created_by) 
            VALUES (?1, ?2, ?3, ?4, ?5)
            ON CONFLICT(id) DO UPDATE SET 
            name = excluded.name,
            subject = excluded.subject,
            classroom = excluded.classroom,
            created_by = excluded.created_by
        ", rusqlite::params![id, name, subject, classroom, created_by])?;
    }
    tx.commit()?;
    Ok(())
}

fn sync_workshops(hub: &mut PooledConn, spoke: &mut Connection) -> std::result::Result<(), Box<dyn std::error::Error>> {
    // Note: dates might need string conversion. We'll pull as string.
    let workshops: Vec<(i32, String, String, String, String)> = hub.query("
        SELECT id, title, description, CAST(date AS CHAR), created_by FROM workshops
    ")?;

    let tx = spoke.transaction()?;
    for (id, title, description, date, created_by) in workshops {
        tx.execute("
            INSERT INTO workshops (id, title, description, date, created_by) 
            VALUES (?1, ?2, ?3, ?4, ?5)
            ON CONFLICT(id) DO UPDATE SET 
            title = excluded.title,
            description = excluded.description,
            date = excluded.date,
            created_by = excluded.created_by
        ", rusqlite::params![id, title, description, date, created_by])?;
    }
    tx.commit()?;
    Ok(())
}
