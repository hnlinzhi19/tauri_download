import { useEffect, useState } from "react";

import { readText } from "@tauri-apps/api/clipboard";
import "./App.css";
import Item, { ItemData } from "./item";
// import Buttons, { UserData } from "./butns";

function App() {
  const [data, setData] = useState<ItemData[]>([]);

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
    <div className="container mx-auto mt-0.5">
      <div className="flex flex-row">
        <div className="basis-1/6">
          <button
            type="button"
            className={`p-2 font-semibold text-xs text-white rounded-full shadow-sm bg-green-800`}
            onClick={() => {
              copy();
            }}
          >
            粘贴数据
          </button>
        </div>
        <div className="basis-5/6 divide-y">
          <table className="border-collapse w-full border border-slate-400  bg-white  text-sm shadow-sm">
            <thead>
              <tr>
                <th className="border border-slate-600 p-2">活动ID</th>
                <th className="border border-slate-600 p-2">UID</th>
                <th className="border border-slate-600 p-2">按钮</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: ItemData) => (
                <Item data={item} key={`${item.meyoId}-${item.activityId}`} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
