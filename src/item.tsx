import { FC, useRef, useState } from 'react';
import Butn from './butn';
export interface ItemData {
  activityId: number;
  approvalTime: number;
  authImg: string;
  charm: number;
  createTime: number;
  id: number;
  lang: string;
  meyoId: number;
  passNum: number;
  period: number;
  startTime: number;
  status: number;
  uid: number;
  videos: string[];
}

interface Props {
  data: ItemData;
}
const Item: FC<Props> = ({ data }) => {
  const [complete, setComplete] = useState(new Map());
  const [clicked, setClicked] = useState(false);
  const ref = useRef(null);
  const updateMap = (k: number, v: number) => {
    setComplete(new Map(complete.set(k, v)));
  };
  const downloadAllFn = () => {
    const elem: HTMLElement | null = ref.current;
    if (elem) {
      // @ts-ignore
      const butns = elem.querySelectorAll('.item-butn');
      butns.forEach((ele: any) => {
        ele.click();
      });
      setClicked(true);
    }
  };
  let values = complete.values();
  let isOkNum = 0;
  let value = values.next().value;
  while (value) {
    if (value === 2) {
      isOkNum += 1;
      value = values.next().value;
      continue;
    }
    break;
  }
  return (
    <tr ref={ref} className="font-semibold text-xs">
      <td className="border border-slate-700 p-2">
        <div className="flex space-x-2 justify-center items-center">
          <span>{data.period}</span>
          <button
            className={`p-1 font-semibold text-xs text-white rounded-full shadow-sm ${isOkNum === data.videos.length ? 'bg-amber-500' : clicked ? 'bg-indigo-500' : 'bg-cyan-500'}`}
            onClick={downloadAllFn}
          >
            {isOkNum === data.videos.length
              ? '已完成'
              : isOkNum > 0
                ? `已下载(${isOkNum}/${data.videos.length})`
                : '全部下载'}
          </button>
        </div>
      </td>
      <td className="border border-slate-700 p-2 text-center">{data.meyoId}</td>
      <td className="border border-slate-700 p-2">
        <div className="flex space-x-2 justify-center">
          {data.videos.map((url: string, index: number) => (
            <Butn
              key={`${data.period}-${index}`}
              url={url}
              id={data.meyoId}
              activityId={data.period}
              index={index}
              cb={(status: number) => {
                updateMap(index, status);
              }}
            />
          ))}
        </div>
      </td>
    </tr>
  );
};
export default Item;
