// Prevents additional console window on Windows in release, DO NOT REMOVE!!

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod download;

use std::collections::HashMap;

use tokio::sync::Mutex;

use download::download;
use lazy_static::lazy_static;
use tauri::{api::dialog::ask, Manager};
lazy_static! {
    static ref DOWNLOADING: Mutex<HashMap<String, u32>> = Mutex::new({
        let m = HashMap::new();
        m
    });
    static ref CLOSEABLE: Mutex<bool> = Mutex::new(false);
}
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}
fn exit() {
    std::process::exit(0x0);
}
fn exit_before() {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        close_window().await;
    });
    loop {
        let mut size = 0;
        rt.block_on(async {
            size = gecrement().await;
        });
        if size.eq(&0) {
            exit();
            break;
        }
    }
}

async fn increment(key: String) {
    let mut down = crate::DOWNLOADING.lock().await;
    down.entry(key).or_insert(1);
}
async fn decrement(key: String) {
    let mut down = crate::DOWNLOADING.lock().await;
    down.remove(&key);
}

async fn gecrement() -> usize {
    let down = crate::DOWNLOADING.lock().await;
    down.values().len()
}

async fn close_window() {
    let mut down = crate::CLOSEABLE.lock().await;
    *down = true;
}
async fn get_close_window() -> bool {
    let down = crate::CLOSEABLE.lock().await;
    *down
}

fn main() {
    let rt = tokio::runtime::Runtime::new().unwrap();

    let app = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, download])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(move |app_handle, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
            exit_before();
        }
        tauri::RunEvent::WindowEvent {
            event: win_event, ..
        } => match win_event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                if let Some(w) = app_handle.get_window("main") {
                    let mut size = 0;
                    rt.block_on(async {
                        size = gecrement().await;
                    });
                    println!("Size: {}", size);

                    if size.gt(&0) {
                        ask(
                            Some(&w),
                            "下载提示",
                            format!("还有{}个下载任务在在运行，确定要关闭吗", size),
                            |answer| {
                                if answer {
                                    exit_before();
                                }
                            },
                        );
                    } else {
                        exit();
                    }
                }
            }
            _ => {}
        },
        _ => {}
    });
}
