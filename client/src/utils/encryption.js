/**
 * Simple E2EE implementation using Web Crypto API
 * For hackathon - uses RSA-OAEP for encryption
 */

const STORAGE_KEY = 'crypto_keypair';
const STORAGE_PUBLIC_KEY = 'crypto_public_key';

/**
 * Generate a new keypair or load existing one from localStorage
 */
export async function getOrCreateKeyPair() {
  try {
    // Try to load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { privateKey, publicKey } = JSON.parse(stored);
      
      // Import keys back to CryptoKey format
      const privateKeyObj = await window.crypto.subtle.importKey(
        'jwk',
        privateKey,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['decrypt']
      );

      const publicKeyObj = await window.crypto.subtle.importKey(
        'jwk',
        publicKey,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['encrypt']
      );

      return { privateKey: privateKeyObj, publicKey: publicKeyObj };
    }

    // Generate new keypair
    const keypair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );

    // Export and store
    const privateKey = await window.crypto.subtle.exportKey('jwk', keypair.privateKey);
    const publicKey = await window.crypto.subtle.exportKey('jwk', keypair.publicKey);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ privateKey, publicKey })
    );

    localStorage.setItem(STORAGE_PUBLIC_KEY, JSON.stringify(publicKey));

    return keypair;
  } catch (error) {
    console.error('Error with keypair:', error);
    throw error;
  }
}

/**
 * Get public key as JWK string (to send to server)
 */
export async function getPublicKeyString() {
  const stored = localStorage.getItem(STORAGE_PUBLIC_KEY);
  if (stored) {
    return stored;
  }

  // Generate if doesn't exist
  const keypair = await getOrCreateKeyPair();
  const publicKey = await window.crypto.subtle.exportKey('jwk', keypair.publicKey);
  const publicKeyStr = JSON.stringify(publicKey);
  localStorage.setItem(STORAGE_PUBLIC_KEY, publicKeyStr);
  return publicKeyStr;
}

/**
 * Encrypt a message for a recipient
 * @param {string} message - Plain text message
 * @param {string} recipientPublicKeyJWK - Recipient's public key as JWK JSON string
 * @returns {string} Base64 encoded encrypted message
 */
export async function encryptMessage(message, recipientPublicKeyJWK) {
  try {
    // Import recipient's public key
    const publicKeyObj = await window.crypto.subtle.importKey(
      'jwk',
      JSON.parse(recipientPublicKeyJWK),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    );

    // Encode message to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Encrypt
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKeyObj,
      data
    );

    // Convert to base64
    return arrayBufferToBase64(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

/**
 * Decrypt a message
 * @param {string} encryptedBase64 - Base64 encoded encrypted message
 * @returns {string} Decrypted plain text
 */
export async function decryptMessage(encryptedBase64) {
  try {
    // Get private key
    const keypair = await getOrCreateKeyPair();

    // Convert from base64
    const encrypted = base64ToArrayBuffer(encryptedBase64);

    // Decrypt
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      keypair.privateKey,
      encrypted
    );

    // Decode to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Unable to decrypt message]';
  }
}

/**
 * Helper: Convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper: Convert Base64 to ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Clear keys (logout)
 */
export function clearKeys() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_PUBLIC_KEY);
}

