const crypto = require("crypto");

// Encryption settings
const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-32-character-secret-key!!"; // Must be 32 characters
const IV_LENGTH = 16;

// Ensure the key is exactly 32 bytes
const KEY = Buffer.from(
  ENCRYPTION_KEY.padEnd(32, "0").substring(0, 32),
  "utf8"
);

/**
 * Encrypt a password for storage
 * @param {string} password - Plain text password
 * @returns {string} - Encrypted password in format: iv:encryptedData
 */
function encryptPassword(password) {
  if (!password) return "";

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return IV and encrypted data separated by ':'
  return iv.toString("hex") + ":" + encrypted;
}

/**
 * Decrypt a password for export
 * @param {string} encryptedPassword - Encrypted password in format: iv:encryptedData
 * @returns {string} - Plain text password
 */
function decryptPassword(encryptedPassword) {
  if (!encryptedPassword) return "";

  try {
    const parts = encryptedPassword.split(":");
    if (parts.length !== 2) return "";

    const iv = Buffer.from(parts[0], "hex");
    const encryptedData = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return "";
  }
}

module.exports = {
  encryptPassword,
  decryptPassword,
};
