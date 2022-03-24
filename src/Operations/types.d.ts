export type OperationManagerOptions = Readonly<{
  operationWorker: string;
}>;

export type OperationFn<T> = (data: T) => void;

export type OperationInfo<T> = {
  readonly name: string;
  readonly data: T;
};

export type Operation<T> = readonly [string, OperationFn<T>];

export type WorkerSendMessage =
  | Readonly<{
      command: "operation-started";
      operationName: OperationInfo["name"];
    }>
  | Readonly<{
      command: "operation-finished";
      operationName: OperationInfo["name"];
    }>;

export type WorkerReceiveMessage = Readonly<{
  command: "run-operation";
  operationInfo: OperationInfo;
}>;
