

export enum MessageType {
  CALL = 2,
  CALL_RESULT = 3,
  CALL_ERROR = 4
}

export interface OcppCall {
  0: MessageType.CALL;
  1: string;        // uniqueId
  2: string;        // action
  3: object;        // payload
}

export interface OcppCallResult {
  0: MessageType.CALL_RESULT;
  1: string;        // uniqueId
  2: object;        // payload
}

export interface OcppCallError {
  0: MessageType.CALL_ERROR;
  1: string;        // uniqueId
  2: string;        // errorCode
  3: string;        // errorDescription
  4: object;        // errorDetails
}