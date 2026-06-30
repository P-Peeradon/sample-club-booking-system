mod node;
mod db;
mod sync;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use mdns_sd::ServiceDaemon;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mdns = ServiceDaemon::new().expect("Failed to create mDNS daemon");
  let peers = Arc::new(Mutex::new(HashMap::new()));
  let db_conn = db::init_db().expect("Failed to initialize SQLite spoke database");

  // Start background Hub-and-Spoke database synchronization
  sync::start_sync_loop();

  tauri::Builder::default()
    .manage(node::NodeState { mdns, peers })
    .manage(db::DbState { conn: Mutex::new(db_conn) })
    .invoke_handler(tauri::generate_handler![
        node::start_node,
        node::get_active_peers,
        db::get_stats,
        db::get_clubs,
        db::get_memberships,
        db::get_club_members,
        db::toggle_club_membership,
        db::get_darwin_chat_history,
        db::send_darwin_message,
        db::get_darwin_inbox_list,
        db::get_pending_clubs,
        db::approve_club,
        db::reject_club
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
