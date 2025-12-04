import { Client } from "@core/Client";
export type CallHandler = (
  client: Client,
  uid: string,
  payload: any
) => Promise<any>; // payload only (not framed)


