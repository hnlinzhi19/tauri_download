import { useState } from "react";

import { readText } from "@tauri-apps/api/clipboard";
import { getClient, ResponseType } from "@tauri-apps/api/http";

import * as fs from "@tauri-apps/api/fs";
import "./App.css";

export interface UserData {
  activityId: number;
  approvalTime: number;
  authImg: string;
  id: number;
  lang: string;
  meyoId: number;
  period: number;
  startTime: number;
  status: number;
  uid: number;
  videos: string[];
}

function App() {
  const [data, setData] = useState<UserData[]>([]);
  async function download(
    url: string,
    fileName: string,
    cb: () => void = () => { },
  ) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("download"));
    const client = await getClient();

    const data = (
      await client.get(url, {
        responseType: ResponseType.Binary,
      })
    ).data as any;
    try {
      await fs.writeBinaryFile(
        fileName, // Change this to where the file should be saved
        data,
        {
          dir: fs.BaseDirectory.Download,
        },
      );
      cb && cb();
    } catch (error) {
      console.log("error", error);
    }
  }

  async function copy() {
    const clipboardText = await readText();
    try {
      console.log(clipboardText);
      if (clipboardText) {
        setData(JSON.parse(clipboardText));
      } else {
        alert("没有复制内容");
      }
    } catch (error) {
      alert("没有复制内容");
    }
  }

  return (
    <div className="container">
      <h1>下载视频：</h1>
      <p
        onClick={() => {
          copy();
        }}
      >
        粘贴数据
      </p>

      {data.map((item: UserData) => (
        <div key={`${item.id}-${item.activityId}`}>
          <span>{item.id}</span>
          <div>
            {item.videos.map((url: string, index: number) => (
              <button
                type="button"
                key={index}
                onClick={() => {
                  download(
                    url,
                    `${item.id}-${item.activityId}-${index + 1}.mp4`,
                  );
                }}
              >
                Download
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                item.videos.forEach((url: string, index: number) => {
                  download(
                    url,
                    `${item.id}-${item.activityId}-${index + 1}.mp4`,
                  );
                });
              }}
            >
              全部
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
