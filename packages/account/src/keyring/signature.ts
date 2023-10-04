import { keccak_256 } from '@noble/hashes/sha3';
import { schnorr, secp256k1 } from '@noble/curves/secp256k1';
import { jubjub } from '@noble/curves/jubjub';
import { mod } from '@noble/curves/abstract/modular';
import { bytesToNumberBE, numberToHexUnpadded } from '@noble/curves/abstract/utils';
import { PrivateKey, PublicKey, Signature, SignatureScheme } from './types.js';

export function getPublicKey(privateKey: Uint8Array | bigint, scheme: SignatureScheme): Uint8Array {
  let normalizedPrivKey: bigint;
  if (privateKey instanceof Uint8Array) privateKey = bytesToNumberBE(privateKey);
  switch (scheme) {
    case SignatureScheme.ECDSA_SECP256K1:
      normalizedPrivKey = mod(privateKey, secp256k1.CURVE.n);

      return secp256k1.getPublicKey(normalizedPrivKey);
    case SignatureScheme.EDDSA_BABYJUBJUB:
      normalizedPrivKey = mod(privateKey, jubjub.CURVE.n);

      return jubjub.getPublicKey(numberToHexUnpadded(normalizedPrivKey));
    default:
      throw 'Not supported signature scheme!';
  }
}

export function sign(message: Uint8Array, privateKey: PrivateKey, scheme: SignatureScheme): Signature {
  let normalizedPrivKey: bigint;
  if (privateKey instanceof Uint8Array) privateKey = bytesToNumberBE(privateKey);
  switch (scheme) {
    case SignatureScheme.ECDSA_SECP256K1: {
      normalizedPrivKey = mod(privateKey, secp256k1.CURVE.n);

      const msgHash = Buffer.from(keccak_256(message));
      const sig = secp256k1.sign(msgHash, normalizedPrivKey);
      const buf = sig.toCompactRawBytes();
      const r = Buffer.from(buf.slice(0, 32));
      const s = Buffer.from(buf.slice(32, 64));
      const v = BigInt((sig.recovery || 0) + 27);

      return { r, s, v };
    }
    case SignatureScheme.EDDSA_BABYJUBJUB: {
      normalizedPrivKey = mod(privateKey, jubjub.CURVE.n);

      //FIXME
      // const sig = jubjub.sign(message, numberToHexUnpadded(normalizedPrivKey));
      return { r: Buffer.from('0x'), s: Buffer.from('0x') };
    }
    default:
      throw 'Not supported signature scheme!';
  }
}

export function verify(signature: Signature, message: Uint8Array, publicKey: PublicKey): boolean {
  switch (publicKey.scheme) {
    case SignatureScheme.ECDSA_SECP256K1: {
      const sig = {
        r: schnorr.utils.bytesToNumberBE(signature.r),
        s: schnorr.utils.bytesToNumberBE(signature.s),
        recovery: signature.v ? Number(signature.v) - 27 : 0,
      };
      const msgHash = Buffer.from(keccak_256(message));

      return secp256k1.verify(sig, msgHash, publicKey.key);
    }
    case SignatureScheme.EDDSA_BABYJUBJUB: {
      return false;
    }
    default:
      throw 'Not supported signature scheme!';
  }
}
