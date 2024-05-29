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
