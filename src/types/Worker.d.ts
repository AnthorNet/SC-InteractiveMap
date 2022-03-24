// A generic version of the built in Worker.
export interface Worker<Receive = any, Send = any, SendError = Send>
  extends EventTarget,
    AbstractWorker {
  onmessage: ((this: Worker, ev: MessageEvent<Send>) => any) | null;

  onmessageerror: ((this: Worker, ev: MessageEvent<SendError>) => any) | null;

  postMessage(message: Receive, transfer: Transferable[]): void;

  postMessage(message: Receive, options?: StructuredSerializeOptions): void;

  terminate(): void;

  addEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}
