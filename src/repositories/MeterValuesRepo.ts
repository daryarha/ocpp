import { db } from "@core/Database";

export const MeterValuesRepo = {
  findActiveTransaction: async (stationId: string, connectorId: number) => {
    const result = await db.query(
      `SELECT transaction_id
       FROM transactions
       WHERE station_id = $1 AND connector_number = $2 AND stop_timestamp IS NULL
       ORDER BY start_timestamp DESC
       LIMIT 1`,
      [stationId, connectorId]
    );

    return result.rows.length ? result.rows[0].transaction_id : null;
  },

  insertMeterValue: async (
    timestamp: string,
    stationId: string,
    connectorId: number,
    transactionId: string | null,
    sv: {
      value: string;
      measurand?: string | null;
      context?: string | null;
      location?: string | null;
      unit?: string | null;
    }
  ) => {
    return db.query(
      `
      INSERT INTO meter_values (
        time, station_id, connector_number, transaction_id,
        value, measurand, context, location, unit
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        timestamp,
        stationId,
        connectorId,
        transactionId,
        sv.value,
        sv.measurand ?? null,
        sv.context ?? null,
        sv.location ?? null,
        sv.unit ?? null
      ]
    );
  }
};
