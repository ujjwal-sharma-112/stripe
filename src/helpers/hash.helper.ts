import crypto from "crypto";

class Hash {
  public static generate(text: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.pbkdf2Sync(text, salt, 10000, 64, 'sha512').toString("hex");
    return {
      salt,
      hash
    };
  }

  public static compare(text: string, hash: string, salt: string) {
    const checkHash = crypto.pbkdf2Sync(text, salt, 10000, 64, 'sha512').toString("hex");
    return hash === checkHash;
  }
}

export default Hash;