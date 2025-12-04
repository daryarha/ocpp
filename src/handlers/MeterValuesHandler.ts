// handlers/MeterValuesHandler.ts
import { CallHandler } from "@type/CallHandler";
import { MeterValuesRequest } from "@validation/ocppSchemas";
import { MeterValuesService } from "@services/MeterValuesService";

export const MeterValuesHandler: CallHandler = async (client, uid, payload) => {
  const parsed = MeterValuesRequest.parse(payload);

  await MeterValuesService.handleMeterValues(client.chargePointId, parsed);

  console.log(
    `⚡ MeterValues from ${client.chargePointId} connector ${parsed.connectorId}`
  );

  return {}; // CALLRESULT payload
};
