import { db } from "@core/Database";

export const StopTransactionRepo = {
  findConnectorByTransaction: async (transactionId: number, stationId: string) => {
    return db.query(
      `SELECT connector_number 
         FROM transactions 
        WHERE transaction_id = $1
          AND station_id = $2`,
      [transactionId, stationId]
    );
  },

  insertFallbackTransaction: async (
    transactionId: number,
    stationId: string,
    connector: number,
    idTag: string | null,
    timestamp: string,
    meterStop: number
  ) => {
    return db.query(
      `INSERT INTO transactions (
          transaction_id, station_id, connector_number, id_tag, start_timestamp, meter_start
        ) VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING connector_number`,
      [transactionId, stationId, connector, idTag, timestamp, meterStop]
    );
  },

  updateStopInfo: async (
    transactionId: number,
    stationId: string,
    timestamp: string,
    meterStop: number,
    reason: string | null
  ) => {
    await db.query(
      `UPDATE transactions
          SET stop_timestamp = $1,
              meter_stop     = $2,
              reason         = $3
        WHERE transaction_id = $4
          AND station_id = $5`,
      [timestamp, meterStop, reason, transactionId, stationId]
    );
  },

  setConnectorAvailable: async (stationId: string, connectorNumber: number) => {
    await db.query(
      `UPDATE station_connectors
          SET last_status = 'Available',
              last_status_at = NOW()
        WHERE station_id = $1
          AND connector_number = $2`,
      [stationId, connectorNumber]
    );
  },

  getIdTagInfo: async (idTag: string) => {
    return db.query(
      `SELECT status, expiry_date, parent_id_tag
         FROM id_tags
        WHERE id_tag = $1`,
      [idTag]
    );
  }
};
