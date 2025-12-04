import WebSocket from "ws";
import { MessageType } from "@type/MessageTypes";
import { OcppErrorCode } from "@type/OcppErrorCode";

export class Client {
  chargePointId: string;
  socket: WebSocket;

  // map for server-initiated CALL requests (CSMS → CP)
  private pendingCalls = new Map<
    string,
    (response: any, error?: any) => void
  >();

  constructor(chargePointId: string, socket: WebSocket) {
    this.chargePointId = chargePointId;
    this.socket = socket;

    socket.on("message", (data) => this.handleResponse(data.toString()));
  }

  /**
   * Called when the charger replies to a CALLREQUEST the server initiated.
   * (Not used yet but required for future RemoteStart/RemoteStop/etc)
   */
  private handleResponse(data: string) {
    try {
      const msg = JSON.parse(data);
      const [type, uid, payloadOrError, details] = msg;

      if (type === MessageType.CALL_RESULT) {
        const resolver = this.pendingCalls.get(uid);
        if (resolver) {
          resolver(payloadOrError, undefined);
          this.pendingCalls.delete(uid);
        }
      }

      if (type === MessageType.CALL_ERROR) {
        const resolver = this.pendingCalls.get(uid);
        if (resolver) {
          resolver(undefined, { errorCode: payloadOrError, details });
          this.pendingCalls.delete(uid);
        }
      }
    } catch {
      console.warn(`[${this.chargePointId}] ⚠️ Invalid CALLRESULT message received`);
    }
  }

  /**
   * Respond to an incoming CALL from the charge point.
   * This is used by Route handlers indirectly.
   */
  sendCallResult(uid: string, payload: any) {
    const frame = [MessageType.CALL_RESULT, uid, payload];
    this.socket.send(JSON.stringify(frame));
    console.log(`↪️ [${this.chargePointId}] CALLRESULT ${uid}`, JSON.stringify(frame));
  }

  /**
   * Send a CALLERROR response to the charge point.
   */
  sendError(
    uid: string,
    errorCode: OcppErrorCode,
    errorDescription: string,
    details: any = {}
  ) {
    const frame = [MessageType.CALL_ERROR, uid, errorCode, errorDescription, details];
    this.socket.send(JSON.stringify(frame));

    console.error(`⛔ [${this.chargePointId}] CALLERROR ${uid}`, {
      errorCode,
      errorDescription,
      details
    });
  }

  /**
   * Send a server-initiated CALL to the charger (RemoteStart, Reset, GetConfiguration, etc)
   */
  sendCall(action: string, payload: any): Promise<any> {
    const uid = crypto.randomUUID();
    const frame = [MessageType.CALL, uid, action, payload];

    this.socket.send(JSON.stringify(frame));
    console.log(`➡️ [${this.chargePointId}] CALL ${action}`, payload);

    // wait for CALLRESULT or CALLERROR
    return new Promise((resolve, reject) => {
      this.pendingCalls.set(uid, (success, error) => {
        if (error) return reject(error);
        return resolve(success);
      });
    });
  }

  /**
   * Utility to check if socket is available and open.
   */
  isConnected(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Clean disconnect
   */
  close(code = 1000, reason = "Closed by server") {
    this.socket.close(code, reason);
  }
}
