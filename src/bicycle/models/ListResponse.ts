import { IBicycle } from "./Bicycle";

export interface IBikeListResponse {
  data: IBicycle[],
  metadata: {
    count: number
  },
}