import { db } from "@core/Database";

export const HeartbeatRepo = {
  updateHeartbeat(stationId: string) {
    return db.query(
      `UPDATE charging_stations
       SET last_heartbeat = NOW()
       WHERE id = $1`,
      [stationId]
    );
  }
};
