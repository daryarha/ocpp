import { HeartbeatRepo } from "@repositories/HeartbeatRepo";
import { OcppError } from "@type/OcppError";
import { OcppErrorCode } from "@type/OcppErrorCode";

export const HeartbeatService = {
  async handleHeartbeat(stationId: string) {
    const result = await HeartbeatRepo.updateHeartbeat(stationId);

    // If no station row updated → unknown charger
    if (result.rowCount === 0) {
      throw new OcppError(
        OcppErrorCode.SecurityError,
        "Station is not registered via BootNotification"
      );
    }

    return {
      currentTime: new Date().toISOString()
    };
  }
};
