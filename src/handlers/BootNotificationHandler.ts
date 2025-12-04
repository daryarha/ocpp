import { CallHandler } from "@type/CallHandler";
import { BootNotificationRequest } from "@validation/ocppSchemas";
import { BootNotificationService } from "@services/bootNotificationService";

export const BootNotificationHandler: CallHandler = async (client, uid, payload) => {
  const data = BootNotificationRequest.parse(payload);
  const result = await BootNotificationService.registerBoot(
    client.chargePointId,
    data
  );

  console.log(`🔔 BootNotification from ${client.chargePointId}`, data);
  return result;
};
