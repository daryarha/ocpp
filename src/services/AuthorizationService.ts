import { AuthorizationRepo } from "@repositories/AuthorizationRepo";
import { OcppError } from "@type/OcppError";
import { OcppErrorCode } from "@type/OcppErrorCode";

export const AuthorizationService = {
  async checkIdTag(idTag: string) {
    const result = await AuthorizationRepo.findIdTag(idTag);

    if (result.rowCount === 0)
      throw new OcppError(OcppErrorCode.SecurityError, "Unknown idTag");

    const item = result.rows[0];
    if (item.status !== "Accepted")
      throw new OcppError(OcppErrorCode.SecurityError, `Status ${item.status}`);

    return {
      idTagInfo: {
        status: item.status,
        ...(item.expiryDate && { expiryDate: item.expiryDate })
      }
    };
  }
};
