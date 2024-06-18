use std::io::Write;

use futures_util::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tauri::{api::path::download_dir, Window};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DownloadFile<'a> {
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
pub async fn download(window: Window, url: &str, name: &str) -> Result<String, String> {
    let _permit = crate::PERMITS.acquire().await.unwrap();
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

    let mut file = std::fs::File::create(&output)
        .or(Err(format!("Create file error: {}", download_file.url)))?;

    let mut download_size: u64 = 0;
    let mut stream = resp.bytes_stream();
    {
        let mut down = crate::DOWNLOADING.lock().await;
        down.entry(name.to_string()).or_insert(1);
    }

    while let Some(v) = stream.next().await {
        let chunk = v.or(Err(format!("Error downloading:{}", url)))?;
        download_size += chunk.len() as u64;
        download_file.change_loaded(download_size);

        let close = {
            let down = crate::CLOSEABLE.lock().await;
            *down
        };

        if close {
            let mut down = crate::DOWNLOADING.lock().await;
            down.remove(name);
            std::fs::remove_file(&output).unwrap();
            break;
        }

        file.write(&chunk)
            .or(Err(format!("Write content error: {}", url)))?;
        window
            .emit("Download", &download_file)
            .or(Err(format!("Download cb error")))?;
    }
    {
        let mut down = crate::DOWNLOADING.lock().await;
        down.remove(name);
    }

    Ok("Success".to_string())
}
