mod node;
mod db;

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use mdns_sd::ServiceDaemon;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mdns = ServiceDaemon::new().expect("Failed to create mDNS daemon");
  let peers = Arc::new(Mutex::new(HashMap::new()));
  let db_conn = db::init_db().expect("Failed to initialize SQLite spoke database");

  tauri::Builder::default()
    .manage(node::NodeState { mdns, peers })
    .manage(db::DbState { conn: Mutex::new(db_conn) })
    .invoke_handler(tauri::generate_handler![
        node::start_node,
        node::get_active_peers,
        db::get_stats
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
