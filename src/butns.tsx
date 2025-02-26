import { FC, useRef, useState } from "react";

import Button from "./butn";
interface Props {
  data: any;
}

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
const Buttons: FC<Props> = ({ data }) => {
  const { videos, meyoId, activityId } = data;
  const ref = useRef(null);
  const [clicked, setClicked] = useState(false);

  return (
    <div ref={ref}>
      {videos.map((url: string, index: number) => (
        <Button
          url={url}
          index={index}
          activityId={activityId}
          id={meyoId}
          key={index}
        />
      ))}
      <a
        href=""
        onClick={(e) => {
          e.preventDefault();
          // @ts-ignore
          const elem: HTMLElement = ref.current;
          if (elem) {
            const butns = elem.querySelectorAll("button");
            butns.forEach((cur: HTMLElement) => {
              if (!cur.classList.contains("loading")) {
                cur.click();
              }
            });
            setClicked(true);
          }
        }}
        style={
          clicked
            ? { background: "#002c8c", color: "#fff", padding: "4px 10px" }
            : { background: "#e6fffb", color: "#000", padding: "4px 10px" }
        }
      >
        全部下载
      </a>
    </div>
  );
};
export default Buttons;
