import { StopTransactionRequest } from "@validation/ocppSchemas";
import { StopTransactionRepo } from "@repositories/StopTransactionRepo";

export class StopTransactionService {
  static async process(stationId: string, payload: StopTransactionRequest) {
    const { transactionId, idTag, meterStop, timestamp, reason } = payload;

    // 1) Try to get connector from existing transaction
    const txResult = await StopTransactionRepo.findConnectorByTransaction(transactionId, stationId);

    let connectorNumber: number;

    if (txResult.rowCount === 0) {
      console.warn(`⚠ Missing StartTransaction for tx ${transactionId} → creating fallback row`);
      const insert = await StopTransactionRepo.insertFallbackTransaction(
        transactionId,
        stationId,
        1,                                // best guess for orphan transactions
        idTag ?? null,
        timestamp,
        meterStop
      );
      connectorNumber = insert.rows[0].connector_number;
    } else {
      connectorNumber = txResult.rows[0].connector_number;
    }

    // 2) Update stop timestamp + meter
    await StopTransactionRepo.updateStopInfo(
      transactionId,
      stationId,
      timestamp,
      meterStop,
      reason ?? null
    );

    // 3) Set connector available again
    await StopTransactionRepo.setConnectorAvailable(stationId, connectorNumber);

    // 4) Auth check when CP sends idTag again
    let idTagStatus = "Accepted";
    let expiryDate: string | undefined;
    let parentIdTag: string | undefined;

    if (idTag) {
      const auth = await StopTransactionRepo.getIdTagInfo(idTag);
      if (auth.rows.length > 0) {
        idTagStatus = auth.rows[0].status ?? "Accepted";
        expiryDate = auth.rows[0].expiry_date ?? undefined;
        parentIdTag = auth.rows[0].parent_id_tag ?? undefined;
      }
    }

    console.log(
      `🛑 StopTransaction stored | Station ${stationId} | Tx ${transactionId} | MeterStop ${meterStop} | Reason ${reason}`
    );

    return {
      idTagInfo: { status: idTagStatus, expiryDate, parentIdTag }
    };
  }
}
