import { StatusNotificationRepo } from "@repositories/StatusNotificationRepo";
import { StatusNotificationRequest } from "@validation/ocppSchemas";

export class StatusNotificationService {
  static async process(
    stationId: string,
    payload: StatusNotificationRequest
  ) {
    const { connectorId, status, errorCode, timestamp } = payload;

    // 1) Ensure connector exists and update last status
    await StatusNotificationRepo.upsertConnector(
      stationId,
      connectorId,
      status,
      timestamp ?? ""
    );

    // 2) Insert historical row (for Timescale)
    await StatusNotificationRepo.insertHistory(
      stationId,
      connectorId,
      status,
      errorCode ?? null,
      timestamp ?? ""
    );

    console.log(
      `🔄 StatusNotification stored | Station ${stationId} | Connector ${connectorId} | Status ${status} | Error ${errorCode ?? "None"}`
    );

    // OCPP spec expects empty response
    return {};
  }
}
