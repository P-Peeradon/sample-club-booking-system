use mdns_sd::{ServiceDaemon, ServiceInfo};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::State;
use tokio::time::{sleep, Duration};

pub struct NodeState {
    pub mdns: ServiceDaemon,
    pub peers: Arc<Mutex<HashMap<String, String>>>, // IP -> Hostname
}

#[tauri::command]
pub async fn start_node(state: State<'_, NodeState>) -> Result<String, String> {
    let mdns = state.mdns.clone();
    
    // Create a service info to broadcast this tablet
    let hostname = format!("elmore-tablet-{}", std::process::id());
    let service_type = "_elmore_node._tcp.local.";
    let instance_name = &hostname;
    let port = 8080;
    let properties = [("school", "ElmoreHigh")];

    let my_ip = "192.168.1.100"; // In a real app, dynamically detect local IP
    let service_info = ServiceInfo::new(
        service_type,
        instance_name,
        &format!("{}.local.", hostname),
        my_ip,
        port,
        &properties[..],
    ).map_err(|e| e.to_string())?;

    // Broadcast our presence
    mdns.register(service_info).map_err(|e| e.to_string())?;

    // Start discovering other peers
    let peers_clone = state.peers.clone();
    let receiver = mdns.browse(service_type).map_err(|e| e.to_string())?;
    
    tokio::spawn(async move {
        while let Ok(event) = receiver.recv_async().await {
            match event {
                mdns_sd::ServiceEvent::ServiceResolved(info) => {
                    let mut peers = peers_clone.lock().unwrap();
                    peers.insert(info.get_addresses().iter().next().unwrap().to_string(), info.get_hostname().to_string());
                },
                mdns_sd::ServiceEvent::ServiceRemoved(_, _) => {
                    // Logic to remove peer
                },
                _ => {}
            }
        }
    });

    Ok(format!("Node {} started and broadcasting on local network", hostname))
}

#[tauri::command]
pub fn get_active_peers(state: State<'_, NodeState>) -> Result<Vec<String>, String> {
    let peers = state.peers.lock().unwrap();
    let mut peer_list = Vec::new();
    for (ip, hostname) in peers.iter() {
        peer_list.push(format!("{} ({})", hostname, ip));
    }
    Ok(peer_list)
}
