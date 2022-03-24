import type { Operation } from "../types";

export type CopyData = {
  markers: Marker[];
};

export type CopyOperation = Operation<CopyData>;
