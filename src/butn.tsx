import { FC, useState } from "react";

import { getClient, ResponseType } from "@tauri-apps/api/http";

import * as fs from "@tauri-apps/api/fs";
interface Props {
  url: string;
  id: number;
  activityId: number;
  index: number;
}
const Button: FC<Props> = ({ url, id, activityId, index }) => {
  const [load, setLoad] = useState(false);
  async function download(
    url: string,
    fileName: string,
    cb: () => void = () => { },
  ) {
    setLoad(true);
    try {
      const client = await getClient();

      const data = (
        await client.get(url, {
          responseType: ResponseType.Binary,
        })
      ).data as any;
      await fs.writeBinaryFile(
        fileName, // Change this to where the file should be saved
        data,
        {
          dir: fs.BaseDirectory.Download,
        },
      );

      setLoad(false);
      cb && cb();
    } catch (error) {
      console.log("error", error);
      setLoad(false);
    }
  }
  return (
    <button
      type="button"
      onClick={() => {
        download(url, `${id}-${activityId}-${index + 1}.mp4`);
      }}
      className={load ? "loading" : ""}
    >
      {index + 1}({load ? "loading" : "unlo"})
    </button>
  );
};
export default Button;
