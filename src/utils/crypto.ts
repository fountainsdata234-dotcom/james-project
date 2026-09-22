/**
 * Client-Side AES-256-GCM Encryption Engine
 * Uses the Web Cryptography API (window.crypto.subtle) to ensure
 * sensitive mental health records and chat logs are never stored in plaintext.
 */

const ALGORITHM_NAME = 'AES-GCM';
const KEY_STORAGE_KEY = 'mh_e2ee_active_key';
const PASSPHRASE_SALT = new TextEncoder().encode('MentalHealthSupportSalt-2026');

export interface EncryptedPayload {
  cipherText: string; // Base64
  iv: string;         // Base64 (12 bytes)
  algorithm: string;  // 'AES-256-GCM'
  timestamp: string;
}

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates a new random 256-bit AES-GCM CryptoKey
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Cryptography API is not supported in this environment.');
  }
  return await window.crypto.subtle.generateKey(
    {
      name: ALGORITHM_NAME,
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives an AES-GCM key from a user passphrase using PBKDF2
 */
export async function deriveKeyFromPassphrase(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: PASSPHRASE_SALT,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM_NAME, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to raw hex string for display/key backup
 */
export async function exportKeyToHex(key: CryptoKey): Promise<string> {
  const raw = await window.crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(raw))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Import a CryptoKey from raw hex string
 */
export async function importKeyFromHex(hex: string): Promise<CryptoKey> {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }

  return await window.crypto.subtle.importKey(
    'raw',
    bytes as BufferSource,
    { name: ALGORITHM_NAME, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a plaintext string into an AES-256-GCM EncryptedPayload
 */
export async function encryptText(text: string, key: CryptoKey): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM_NAME,
      iv: iv as BufferSource,
    },
    key,
    data as BufferSource
  );

  return {
    cipherText: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(iv.buffer),
    algorithm: 'AES-256-GCM',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Decrypt an AES-256-GCM EncryptedPayload back into plaintext
 */
export async function decryptText(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
  const cipherBytes = base64ToBuffer(payload.cipherText);
  const ivBytes = base64ToBuffer(payload.iv);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: ALGORITHM_NAME,
      iv: ivBytes as BufferSource,
    },
    key,
    cipherBytes as BufferSource
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Check if the active key is stored or initialize a default secure session key
 */
export async function getOrCreateSessionKey(): Promise<{ key: CryptoKey; hex: string }> {
  try {
    const storedHex = localStorage.getItem(KEY_STORAGE_KEY);
    if (storedHex && storedHex.length === 64) {
      const key = await importKeyFromHex(storedHex);
      return { key, hex: storedHex };
    }
    const newKey = await generateEncryptionKey();
    const hex = await exportKeyToHex(newKey);
    localStorage.setItem(KEY_STORAGE_KEY, hex);
    return { key: newKey, hex };
  } catch (err) {
    console.warn('Failed to access localStorage for crypto key, creating transient key', err);
    const fallbackKey = await generateEncryptionKey();
    const hex = await exportKeyToHex(fallbackKey);
    return { key: fallbackKey, hex };
  }
}
