import { ChargingStationRepo } from "@repositories/ChargingStationRepo";
import { OcppError } from "@type/OcppError";
import { OcppErrorCode } from "@type/OcppErrorCode";

const HEARTBEAT_INTERVAL = 300;

export const BootNotificationService = {
  async registerBoot(stationId: string, payload: any) {
    if (!payload.chargePointVendor || !payload.chargePointModel) {
      throw new OcppError(
        OcppErrorCode.FormationViolation,
        "Vendor and model must be provided"
      );
    }

    await ChargingStationRepo.upsertStation(
      stationId,
      payload.chargePointVendor,
      payload.chargePointModel,
      payload.chargePointSerialNumber ?? null,
      payload.firmwareVersion ?? null
    );

    await ChargingStationRepo.logBootNotification(
      stationId,
      "Accepted",
      HEARTBEAT_INTERVAL
    );

    return {
      status: "Accepted",
      currentTime: new Date().toISOString(),
      interval: HEARTBEAT_INTERVAL
    };
  }
};
