import { CallHandler } from "@type/CallHandler";
import { StartTransactionRequest } from "@validation/ocppSchemas";
import { startTransactionService } from "@services/StartTransactionService";

export const StartTransactionHandler: CallHandler = async (client, uid, payload) => {
  const parsed = StartTransactionRequest.parse(payload);

  const result = await startTransactionService.startTransaction(
    client.chargePointId,
    parsed
  );

  console.log(
    `🚀 StartTransaction | Station ${client.chargePointId} | Connector ${parsed.connectorId} | TX ${result.transactionId}`
  );

  return result; // handler no longer builds format manually — service does
};
