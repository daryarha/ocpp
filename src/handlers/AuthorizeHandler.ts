import { CallHandler } from "@type/CallHandler";
import { AuthorizeSchema } from "@validation/ocppSchemas";
import { AuthorizationService } from "@services/AuthorizationService";

export const AuthorizeHandler: CallHandler = async (client, uid, payload) => {
  const { idTag } = AuthorizeSchema.parse(payload);
  const result = await AuthorizationService.checkIdTag(idTag);
  return result;
};
