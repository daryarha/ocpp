import { BootNotificationHandler } from "@handlers/BootNotificationHandler";
import { StatusNotificationHandler } from "@handlers/StatusNotificationHandler";
import { StartTransactionHandler } from "@handlers/StartTransactionHandler";
import { StopTransactionHandler } from "@handlers/StopTransactionHandler";
import { MeterValuesHandler } from "@handlers/MeterValuesHandler";
import { AuthorizeHandler } from "@handlers/AuthorizeHandler";
import { HeartbeatHandler } from "@handlers/HeartbeatHandler";

const routeTable = {
  BootNotification: BootNotificationHandler,
  Heartbeat: HeartbeatHandler,
  StatusNotification: StatusNotificationHandler,
  StartTransaction: StartTransactionHandler,
  StopTransaction: StopTransactionHandler,
  MeterValues: MeterValuesHandler,
  Authorize: AuthorizeHandler
};

export default routeTable;