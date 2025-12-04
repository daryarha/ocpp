import { MeterValuesRepo } from "@repositories/MeterValuesRepo";
import { MeterValuesRequest } from "@validation/ocppSchemas";

export const MeterValuesService = {
  handleMeterValues: async (
    stationId: string,
    parsedPayload: MeterValuesRequest
  ) => {
    const { connectorId, meterValue } = parsedPayload;

    // Get transaction from DB if still running
    const activeTxId = await MeterValuesRepo.findActiveTransaction(
      stationId,
      connectorId
    );

    const transactionId = parsedPayload.transactionId ?? activeTxId ?? null;

    for (const mv of meterValue) {
      for (const sv of mv.sampledValue) {
        await MeterValuesRepo.insertMeterValue(
          mv.timestamp,
          stationId,
          connectorId,
          transactionId,
          sv
        );
      }
    }

    return {
      count: meterValue.length,
      connectorId
    };
  }
};
