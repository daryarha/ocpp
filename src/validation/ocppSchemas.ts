import { z } from "zod";

/**
 * Common
 */
export const isoTimestamp = z.string().refine(
  s => !Number.isNaN(Date.parse(s)),
  { message: "must be an ISO 8601 timestamp" }
);

/**
 * BootNotificationRequest
 * → maps to charging_stations + boot_notifications table
 */
export const BootNotificationRequest = z.object({
  chargePointVendor: z.string(),
  chargePointModel: z.string(),
  chargePointSerialNumber: z.string().optional(),
  chargeBoxSerialNumber: z.string().optional(),
  firmwareVersion: z.string().optional(),
  iccid: z.string().optional(),
  imsi: z.string().optional(),
  meterType: z.string().optional(),
  meterSerialNumber: z.string().optional(),
});
export type BootNotificationRequest = z.infer<typeof BootNotificationRequest>;

/**
 * Heartbeat
 */
export const HeartbeatRequest = z.object({});
export type HeartbeatRequest = z.infer<typeof HeartbeatRequest>;

/**
 * StatusNotification
 * → maps to status_notifications + station_connectors.last_status
 */
export const StatusNotificationRequest = z.object({
  connectorId: z.number().int().positive(),
  status: z.enum([
    "Available", "Preparing", "Charging", "SuspendedEV", "SuspendedEVSE",
    "Finishing", "Reserved", "Unavailable", "Faulted"
  ]),
  errorCode: z.string().optional(),
  info: z.string().optional(),
  timestamp: isoTimestamp.optional(),
  vendorId: z.string().optional(),
  vendorErrorCode: z.string().optional()
});
export type StatusNotificationRequest = z.infer<typeof StatusNotificationRequest>;

/**
 * Authorize
 * → maps to id_tags table
 */
export const AuthorizeSchema = z.object({
  idTag: z.string().min(1)
});

export const AuthorizeResponseSchema = z.object({
  idTagInfo: z.object({
    status: z.enum([
      "Accepted", "Blocked", "Expired", "Invalid", "ConcurrentTx"
    ]),
    expiryDate: isoTimestamp.optional(),
    parentIdTag: z.string().optional()
  })
});

/**
 * StartTransaction
 * → maps to transactions table
 */
export const StartTransactionRequest = z.object({
  connectorId: z.number().int().positive(),
  idTag: z.string(),
  timestamp: isoTimestamp,
  meterStart: z.number().nonnegative(),
  reservationId: z.number().int().optional(), // DB doesn't store it, but safe for OCPP
});
export type StartTransactionRequest = z.infer<typeof StartTransactionRequest>;

/**
 * StopTransaction
 * → maps to transactions table
 */
export const StopTransactionRequest = z.object({
  transactionId: z.number().int().positive(),
  timestamp: isoTimestamp,
  meterStop: z.number().nonnegative(),
  reason: z.string().optional(),
  idTag: z.string().optional(), // forwarded sometimes for updating expiry
});
export type StopTransactionRequest = z.infer<typeof StopTransactionRequest>;

/**
 * MeterValues
 * → maps to meter_values hypertable
 */
const SampledValue = z.object({
  value: z.string(),                     // DB expects NUMERIC — convert before insert
  measurand: z.string().optional(),      // DB default: Energy.Active.Import.Register
  context: z.string().optional(),
  location: z.string().optional(),
  unit: z.string().optional()
});

const MeterValue = z.object({
  timestamp: isoTimestamp,
  sampledValue: z.array(SampledValue).min(1)
});

export const MeterValuesRequest = z.object({
  connectorId: z.number().int().positive(),
  transactionId: z.number().int().optional(),
  meterValue: z.array(MeterValue).min(1)
});
export type MeterValuesRequest = z.infer<typeof MeterValuesRequest>;

/**
 * Mapping action -> schema
 */
export const OCPP_ACTION_SCHEMAS = {
  BootNotification: BootNotificationRequest,
  Heartbeat: HeartbeatRequest,
  StatusNotification: StatusNotificationRequest,
  Authorize: AuthorizeSchema,
  StartTransaction: StartTransactionRequest,
  StopTransaction: StopTransactionRequest,
  MeterValues: MeterValuesRequest
} as const;
