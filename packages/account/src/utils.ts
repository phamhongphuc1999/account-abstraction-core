import { publicToAddress, bufferToHex } from '@ethereumjs/util';

/**
 * Get default EOA address from public key on EVM networks
 * @param pubKey
 */
export function getEVMAddressFromPublicKey(publicKey: Uint8Array): string {
  return bufferToHex(publicToAddress(Buffer.from(publicKey), true)).toLowerCase();
}
