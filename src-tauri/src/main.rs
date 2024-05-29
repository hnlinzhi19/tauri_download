// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{io::Write, string};

use futures_util::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{api::path::download_dir, Window};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Clone, Deserialize, Serialize)]
struct DownloadFile<'a> {
    name: &'a str,
    url: &'a str,
    size: u64,
    downloaded: u64,
    percent: String,
}
impl<'a> DownloadFile<'a> {
    fn new(name: &'a str, url: &'a str) -> Self {
        Self {
            name,
            url,
            size: 0,
            downloaded: 0,
            percent: "".to_string(),
        }
    }
    fn change_loaded(&mut self, size: u64) {
        self.downloaded = size / 1024;
        if self.size > 0 {
            self.percent = format!("{:.1}", self.downloaded as f64 / self.size as f64 * 100.);
        }
    }

    fn change_total_size(&mut self, size: u64) {
        self.size = size / 1024;
    }
}

#[tauri::command]
async fn download(window: Window, url: &str, name: &str) -> Result<String, String> {
    let mut download_file = DownloadFile::new(name, url);
    let client = Client::new();
    let resp = client
        .get(download_file.url)
        .send()
        .await
        .or(Err(format!("Get url error:{}", download_file.url)))?;

    let size = resp
        .content_length()
        .ok_or(format!("Error get size: {}", download_file.url))?;

    download_file.change_total_size(size);

    let output = download_dir()
        .unwrap()
        .join(format!("{}.mp4", download_file.name));

    let mut file = std::fs::File::create(output)
        .or(Err(format!("Create file error: {}", download_file.url)))?;

    let mut download_size: u64 = 0;
    let mut stream = resp.bytes_stream();
    while let Some(v) = stream.next().await {
        let chunk = v.or(Err(format!("Error downloading:{}", url)))?;
        download_size += chunk.len() as u64;
        download_file.change_loaded(download_size);

        file.write(&chunk)
            .or(Err(format!("Write content error: {}", url)))?;
        window
            .emit("Download", &download_file)
            .or(Err(format!("Download cb error")))?;
    }

    Ok("Success".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, download])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
