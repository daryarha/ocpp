import { WebSocketServer } from "ws";
import { Client } from "./Client";
import routes from "@router/RouteTable";
import { MessageType } from "@type/MessageTypes";
import { OcppErrorCode } from "@type/OcppErrorCode";
import { ZodSchema } from "zod";
import { OCPP_ACTION_SCHEMAS } from "@validation/ocppSchemas";

export default class OcppServer {
  wss: WebSocketServer;
  clients = new Map<string, Client>();
  shuttingDown = false;

  constructor(port: number) {
    this.wss = new WebSocketServer({
      port,
      handleProtocols: (protocols) =>
        protocols.has("ocpp1.6") ? "ocpp1.6" : false
    });

    this.wss.on("connection", (ws, req) => {
      if (this.shuttingDown) {
        ws.close(1001, "Server shutting down");
        return;
      }

      const chargePointId = req.url?.replace("/", "") || "unknown";
      const client = new Client(chargePointId, ws);
      this.clients.set(chargePointId, client);

      console.log(`🔌 Charger connected: ${chargePointId}`);

      ws.on("message", (msg) => this.handleMessage(client, msg.toString()));
      ws.on("close", () => {
        this.clients.delete(chargePointId);
        console.log(`❌ Disconnected: ${chargePointId}`);
      });
    });

    console.log(`🚀 OCPP Server running on ws://localhost:${port}`);
  }

  private async handleMessage(client: Client, data: string) {
    let msg: any;

    try {
      msg = JSON.parse(data);
    } catch {
      return client.sendError("", OcppErrorCode.FormationViolation, "Invalid JSON format");
    }

    const [type, uid, action, payload] = msg;

    if (type !== MessageType.CALL) {
      return client.sendError(uid, OcppErrorCode.ProtocolError, "Only CALL messages supported");
    }
    type OcppAction = keyof typeof routes;

    const handler = routes[action as OcppAction];
    if (!handler) {
      return client.sendError(uid, OcppErrorCode.NotSupported, `Handler for '${action}' not implemented`);
    }

    // Schemas are optional — absence is allowed
    const schema = (OCPP_ACTION_SCHEMAS as Record<string, ZodSchema | undefined>)[action];

    const payloadToValidate = payload ?? {};

    if (schema) {
      const parsed = schema.safeParse(payloadToValidate);
      if (!parsed.success) {
        const details = parsed.error.issues.map(e => ({
          path: e.path.join("."),
          message: e.message
        }));
        return client.sendError(
          uid,
          OcppErrorCode.TypeConstraintViolation,
          "Payload validation failed",
          { details }
        );
      }

      // Validated & typed payload
      try {
        const response = await handler(client, uid, parsed.data);
        return client.sendCallResult(uid, response);
      } catch (err: any) {
        if (err?.message == "NotAuthorized") {
          return client.sendError(uid, OcppErrorCode.SecurityError, err?.message ?? "Handler failed");
        }
        return client.sendError(uid, OcppErrorCode.InternalError, err?.message ?? "Handler failed");
      }
    }

    // No schema (legacy support)
    try {
      const response = await handler(client, uid, payloadToValidate);
      return client.sendCallResult(uid, response);
    } catch (err: any) {
        if (err?.code) {
          return client.sendError(uid, OcppErrorCode.SecurityError, err?.message ?? "Handler failed");
        }
      return client.sendError(uid, OcppErrorCode.InternalError, err?.message ?? "Handler failed");
    }
  }

  async shutdown() {
    console.log("\n🛑 Graceful shutdown started...");
    this.shuttingDown = true;

    // Stop accepting new WebSocket upgrades
    this.wss.close();

    // Close active clients
    for (const [id, client] of this.clients) {
      console.log(`🔌 Closing connection: ${id}`);
      client.socket.close(1001, "Server shutting down");
    }

    // Ensure all sockets exit
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("✅ Shutdown complete");
  }
}
