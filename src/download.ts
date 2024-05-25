import { getClient, ResponseType } from "@tauri-apps/api/http";
import { writeBinaryFile, BaseDirectory } from "@tauri-apps/api/fs";
const maxSize = 5;
class AsyncQueue {
  queue: any[];
  runSize: number;
  constructor() {
    this.queue = [];
    this.runSize = 0;
  }

  enqueue(task: any) {
    return new Promise((resolve, reject) => {
      this.queue.push(() => task().then(resolve).catch(reject));
    });
  }

  dequeue() {
    console.log("deque");
    if (this.queue.length === 0 || this.runSize >= maxSize) {
      return;
    }
    console.log("start task");

    const task = this.queue.shift();
    task();
    this.runSize += 1;
  }
  delete() {
    if (this.runSize > 0) {
      this.runSize -= 1;
    }
  }
}

export const asyncQueue = new AsyncQueue();

export const addTak = (
  key: string,
  url: string,
  cb: () => void,
  error: () => void,
) => {
  asyncQueue.enqueue(async () => {
    try {
      console.log("start down load", key);
      const client = await getClient();
      const data = (
        await client.get(url, {
          responseType: ResponseType.Binary,
        })
      ).data as any;
      await writeBinaryFile(
        `${key}.mp4`, // Change this to where the file should be saved
        data,
        {
          dir: BaseDirectory.Download,
        },
      );
      console.log("write finish");
      cb();
    } catch (e) {
      console.log(e);
      error();
    }
    asyncQueue.delete();
    asyncQueue.dequeue();
  });
  asyncQueue.dequeue();
};
