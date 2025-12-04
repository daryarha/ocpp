import { CallHandler } from "@type/CallHandler";
import { StopTransactionService } from "@services/StopTransactionService";
import { StopTransactionRequest } from "@validation/ocppSchemas";

export const StopTransactionHandler: CallHandler = async (client, uid, payload) => {
  const parsed = StopTransactionRequest.parse(payload);
  const stationId = client.chargePointId;
  return StopTransactionService.process(stationId, parsed);
};
