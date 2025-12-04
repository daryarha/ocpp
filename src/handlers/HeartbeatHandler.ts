import { CallHandler } from "@type/CallHandler";
import { HeartbeatRequest } from "@validation/ocppSchemas";
import { HeartbeatService } from "@services/HeartbeatService";

export const HeartbeatHandler: CallHandler = async (client, uid, payload) => {
  const parsed = HeartbeatRequest.parse(payload);
  const stationId = client.chargePointId;
  const response = await HeartbeatService.handleHeartbeat(client.chargePointId);

  console.log(`💓 Heartbeat from ${client.chargePointId}`);
  return response;
};
