import { OcppErrorCode } from "@type/OcppErrorCode";

export class OcppError extends Error {
  code: OcppErrorCode;
  details: any;

  constructor(code: OcppErrorCode, description: string, details: any = {}) {
    super(description);
    this.code = code;
    this.details = details;
  }
}
