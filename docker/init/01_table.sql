-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ==================================
-- Charging Stations (Charge Point)
-- ==================================
CREATE TABLE charging_stations (
    id TEXT PRIMARY KEY,                          -- chargePointId from OCPP WebSocket URL
    vendor TEXT NOT NULL,
    model TEXT NOT NULL,
    serial_number TEXT,
    firmware_version TEXT,
    iccid TEXT,
    imsi TEXT,
    meter_type TEXT,
    meter_serial TEXT,
    last_heartbeat TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================================
-- OCPP Authorizations (idTags)
-- ==================================
CREATE TABLE id_tags (
    id_tag           VARCHAR(50) PRIMARY KEY,
    parent_id_tag    VARCHAR(50) NULL REFERENCES id_tags(id_tag) ON DELETE SET NULL,
    status           VARCHAR(32) NOT NULL,   -- Accepted, Blocked, Expired, ConcurrentTx, Invalid
    expiry_date      TIMESTAMPTZ NULL,
    max_tx_per_day   INT DEFAULT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_id_tags_status ON id_tags(status);

-- ==================================
-- One station can have multiple connectors
-- ==================================
CREATE TABLE station_connectors (
    id SERIAL PRIMARY KEY,
    station_id TEXT NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_number INT NOT NULL,
    last_status TEXT,
    last_status_at TIMESTAMPTZ,
    UNIQUE(station_id, connector_number)
);

-- ==================================
-- Boot Notif. History (not current state)
-- ==================================
CREATE TABLE boot_notifications (
    id BIGSERIAL PRIMARY KEY,
    station_id TEXT NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    interval INT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================================
-- Status Notification Log
-- ==================================
CREATE TABLE status_notifications (
    id BIGSERIAL PRIMARY KEY,
    station_id TEXT NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_number INT NOT NULL,
    status TEXT NOT NULL,
    error_code TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    -- Latest status sync
    is_latest BOOLEAN NOT NULL DEFAULT TRUE
);
-- Auto-ensures only latest=True per station+connector
CREATE INDEX idx_status_not_latest ON status_notifications(station_id, connector_number, is_latest);

-- ==================================
-- Transactions
-- ==================================
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id INT UNIQUE NOT NULL,           -- OCPP transaction ID
    station_id TEXT NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_number INT NOT NULL,
    id_tag VARCHAR(50) REFERENCES id_tags(id_tag) ON DELETE CASCADE,
    start_timestamp TIMESTAMPTZ NOT NULL,
    stop_timestamp TIMESTAMPTZ,
    meter_start INT NOT NULL,
    meter_stop INT,
    reason TEXT,
    cost NUMERIC NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================================
-- Meter Values (TimescaleDB)
-- ==================================
CREATE TABLE meter_values (
    time TIMESTAMPTZ NOT NULL,
    station_id TEXT NOT NULL REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_number INT NOT NULL,
    transaction_id INT,
    value NUMERIC NOT NULL,
    measurand TEXT DEFAULT 'Energy.Active.Import.Register',
    context TEXT,
    location TEXT,
    unit TEXT
);

-- Convert to hypertable
SELECT create_hypertable('meter_values', 'time', if_not_exists => TRUE);

-- Enable compression on hypertable
ALTER TABLE meter_values
SET (
  timescaledb.compress,
  timescaledb.compress_orderby = 'time DESC',
  timescaledb.compress_segmentby = 'station_id'
);

-- Apply automatic compression policy
SELECT add_compression_policy('meter_values', INTERVAL '7 days');


-- ==================================
-- Add Indexes
-- ==================================
CREATE INDEX idx_stations_last_heartbeat ON charging_stations(last_heartbeat);
CREATE INDEX idx_status_notifications_ts ON status_notifications(timestamp DESC);
CREATE INDEX idx_transactions_active ON transactions(transaction_id) WHERE stop_timestamp IS NULL;
CREATE INDEX idx_mv_station_time ON meter_values(station_id, time DESC);
CREATE INDEX idx_mv_transaction ON meter_values(transaction_id);
