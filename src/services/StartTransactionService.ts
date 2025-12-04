import { StartTransactionRequest } from "@validation/ocppSchemas";
import { StartTransactionRepo as repo } from "@repositories/StartTransactionRepo";
import { OcppErrorCode } from "@type/OcppErrorCode";
import { OcppError } from "@type/OcppError";

export const startTransactionService = {
  async startTransaction(stationId: string, payload: StartTransactionRequest) {
    const { connectorId, idTag, timestamp, meterStart } = payload;

    // Validate ID Tag
    const idTagRecord = await repo.findIdTag(idTag);
    if (!idTagRecord || idTagRecord.status !== "Accepted") {
      throw new OcppError(
              OcppErrorCode.SecurityError,
              "ID Tag is not registered or the status is not accepted"
            );
    }

    // Generate OCPP transaction ID
    const transactionId = Math.floor(100000 + Math.random() * 900000);

    // Save transaction
    await repo.insertTransaction(
      transactionId,
      stationId,
      connectorId,
      idTag,
      timestamp,
      meterStart
    );

    return {
      transactionId,
      idTagInfo: {
        status: "Accepted",
        expiryDate: idTagRecord.expiry_date,
      },
    };
  },
};
