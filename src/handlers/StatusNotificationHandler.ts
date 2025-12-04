import { CallHandler } from "@type/CallHandler";
import { StatusNotificationService } from "@services/StatusNotificationService";
import { StatusNotificationRequest } from "@validation/ocppSchemas";

export const StatusNotificationHandler: CallHandler = async (client, uid, payload) => {
  const parsed = StatusNotificationRequest.parse(payload);
  const stationId = client.chargePointId;
  
  return StatusNotificationService.process(stationId, parsed);
};
