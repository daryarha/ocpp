import { db } from "@core/Database";

export const ChargingStationRepo = {
  upsertStation(stationId: string, vendor: string, model: string, serial: string | null, firmware: string | null) {
    return db.query(
      `INSERT INTO charging_stations (id, vendor, model, serial_number, firmware_version, last_heartbeat)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE
         SET vendor = EXCLUDED.vendor,
             model = EXCLUDED.model,
             serial_number = EXCLUDED.serial_number,
             firmware_version = EXCLUDED.firmware_version,
             last_heartbeat = NOW()`,
      [stationId, vendor, model, serial, firmware]
    );
  },

  logBootNotification(stationId: string, status: string, interval: number) {
    return db.query(
      `INSERT INTO boot_notifications (station_id, status, interval)
       VALUES ($1, $2, $3)`,
      [stationId, status, interval]
    );
  }
};
