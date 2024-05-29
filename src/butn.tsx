import { FC, useEffect, useState } from "react";

import { exists, BaseDirectory } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { asyncQueue } from "./download";

interface Props {
  url: string;
  id: number;
  activityId: number;
  index: number;
  cb?: (n: number) => void;
}
const Button: FC<Props> = ({ url, id, activityId, index, cb }) => {
  const [load, setLoad] = useState(0); // 0 before load 1 loading 2 loaded 3 load error
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      const name = `${id}-${activityId}-${index + 1}.mp4`;
      const hasFile: boolean = await exists(name, {
        dir: BaseDirectory.Download,
      });
      console.log(hasFile, name);

      if (hasFile) {
        setLoad(2);
        cb && cb(2);
      }
    })();
  }, [id, activityId, index]);
  useEffect(() => {
    const name = `${id}-${activityId}-${index + 1}`;

    const unbind = listen("Download", ({ payload }: any) => {
      if (payload.name === name) {
        setProgress(Number(payload.percent));
      }
    });
    return () => {
      unbind.then((f) => f());
    };
  }, [id, activityId, index]);

  return (
    <button
      key={index}
      data-width="10%"
      className="item-butn px-2 py-1 justify-center flex font-semibold space-x-1 text-xs bg-cyan-500 text-white rounded-full shadow-sm"
      onClick={() => {
        if (load === 1) {
          return;
        }
        setLoad(1);
        asyncQueue
          .enqueue(async () => {
            invoke("download", {
              url: url,
              name: `${id}-${activityId}-${index + 1}`,
            })
              .then(() => {
                asyncQueue.delete();
                setLoad(2);
                cb && cb(2);
                asyncQueue.dequeue();
              })
              .catch((e) => {
                asyncQueue.delete();
                console.error(e);
                setLoad(3);
                cb && cb(3);
                asyncQueue.dequeue();
              });
          })
          .catch(() => {
            asyncQueue.delete();
            console.error("Queue error");
            setLoad(3);
            cb && cb(3);
            asyncQueue.dequeue();
          });
        asyncQueue.dequeue();
      }}
    >
      <b style={{ width: `${progress}%` }}></b>
      <span>{load === 1 ? `${progress}%` : index + 1}</span>

      {load === 3 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          className="stroke-1 fill-white"
          width="14"
          height="14"
        >
          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
        </svg>
      ) : null}
      {load === 2 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="stroke-1 fill-white"
          width="14"
          height="14"
        >
          <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
        </svg>
      ) : null}
      {load === 1 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="stroke-1 fill-white"
          width="14"
          height="14"
        >
          <path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z" />
        </svg>
      ) : null}
      {load === 0 ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="stroke-1 fill-white"
          width="14"
          height="14"
        >
          <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
        </svg>
      ) : null}
    </button>
  );
};
export default Button;
