import { useEffect, useState } from "react";

import { readText } from "@tauri-apps/api/clipboard";
import "./App.css";
import Buttons, { UserData } from "./butns";

function App() {
  const [data, setData] = useState<UserData[]>([]);

  async function copy() {
    const clipboardText = await readText();
    try {
      console.log(clipboardText);
      if (clipboardText) {
        setData(JSON.parse(clipboardText));
      } else {
        alert("复制内容错误");
      }
    } catch (error) {
      alert("没有复制内容");
    }
  }
  useEffect(() => {
    document.title = "下载";
  }, []);

  return (
    <div className="container">
      <div>
        <button
          type="button"
          onClick={() => {
            copy();
          }}
        >
          粘贴数据
        </button>
      </div>

      {data.map((item: UserData) => (
        <div key={`${item.meyoId}-${item.activityId}`}>
          <span>
            {item.activityId}-{item.meyoId}
          </span>

          <Buttons data={item} />
        </div>
      ))}
    </div>
  );
}

export default App;
