import { db } from "@core/Database";

export const StartTransactionRepo = {
  findIdTag: async (idTag: string) => {
    const result = await db.query(
      `SELECT status, expiry_date FROM id_tags WHERE id_tag = $1`,
      [idTag]
    );
    return result.rows[0] ?? null;
  },

  insertTransaction: async (
    transactionId: number,
    stationId: string,
    connectorId: number,
    idTag: string,
    timestamp: string,
    meterStart: number
  ) => {
    await db.query(
      `INSERT INTO transactions (
        transaction_id,
        station_id,
        connector_number,
        id_tag,
        start_timestamp,
        meter_start
      ) VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        transactionId,
        stationId,
        connectorId,
        idTag,
        timestamp,
        meterStart
      ]
    );
  },
};
