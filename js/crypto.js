/**
 * CryptoService - Client-side AES-GCM 256-bit encryption using native Web Crypto API.
 * Ensures zero plaintext leaks, perfect for GitHub static hosting & offline privacy.
 */
class CryptoService {
  /**
   * Helper: Convert ArrayBuffer to Base64
   */
  static bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Helper: Convert Base64 to ArrayBuffer
   */
  static base64ToBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Derive AES-GCM key from PIN and Salt using PBKDF2
   */
  static async deriveKey(pin, saltBuffer) {
    const enc = new TextEncoder();
    const pinBuffer = enc.encode(pin);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      pinBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt arbitrary string with a PIN
   * Returns: { encrypted: true, salt: base64, iv: base64, cipher: base64 }
   */
  static async encrypt(plainText, pin) {
    try {
      const enc = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await this.deriveKey(pin, salt);

      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        enc.encode(plainText)
      );

      return {
        encrypted: true,
        v: 1,
        salt: this.bufferToBase64(salt),
        iv: this.bufferToBase64(iv),
        cipher: this.bufferToBase64(ciphertext)
      };
    } catch (err) {
      console.error('Encryption failed:', err);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt encrypted payload with PIN
   * Throws Error if PIN is incorrect or corrupted
   */
  static async decrypt(payload, pin) {
    try {
      if (!payload || !payload.cipher || !payload.iv || !payload.salt) {
        throw new Error('Invalid encrypted payload');
      }

      const salt = this.base64ToBuffer(payload.salt);
      const iv = this.base64ToBuffer(payload.iv);
      const cipher = this.base64ToBuffer(payload.cipher);

      const key = await this.deriveKey(pin, new Uint8Array(salt));

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        cipher
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (err) {
      throw new Error('INVALID_PIN');
    }
  }

  /**
   * Fast hash to verify PIN without decrypting entire database every time
   */
  static async hashPin(pin, saltHex) {
    const enc = new TextEncoder();
    const salt = saltHex ? this.base64ToBuffer(saltHex) : window.crypto.getRandomValues(new Uint8Array(16));
    const combined = new Uint8Array(pin.length + 16);
    combined.set(enc.encode(pin), 0);
    combined.set(new Uint8Array(salt), pin.length);

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combined);
    return {
      salt: this.bufferToBase64(salt),
      hash: this.bufferToBase64(hashBuffer)
    };
  }
}

window.CryptoService = CryptoService;
