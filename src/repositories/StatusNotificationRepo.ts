import { db } from "@core/Database";

export const StatusNotificationRepo = {
  upsertConnector: async (
    stationId: string,
    connectorId: number,
    status: string,
    timestamp: string
  ) => {
    await db.query(
      `INSERT INTO station_connectors (station_id, connector_number, last_status, last_status_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (station_id, connector_number)
       DO UPDATE SET last_status = EXCLUDED.last_status,
                     last_status_at = EXCLUDED.last_status_at`,
      [stationId, connectorId, status, timestamp]
    );
  },

  insertHistory: async (
    stationId: string,
    connectorId: number,
    status: string,
    errorCode: string | null,
    timestamp: string
  ) => {
    await db.query(
      `INSERT INTO status_notifications (
        station_id, connector_number, status, error_code, timestamp
      ) VALUES ($1,$2,$3,$4,$5)`,
      [stationId, connectorId, status, errorCode, timestamp]
    );
  }
};
