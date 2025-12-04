import { db } from "@core/Database";

export const AuthorizationRepo = {
  async findIdTag(idTag: string) {
    return db.query(
      `SELECT id_tag, status, expiry_date 
       FROM id_tags 
       WHERE id_tag = $1`,
      [idTag]
    );
  }
};
