export enum SignatureScheme {
  ECDSA_SECP256K1 = 'ECDSA secp256k1',
  EDDSA_BABYJUBJUB = 'EDDSA Baby Jubjub',
}

export type SignatureType = {
  r: Buffer;
  s: Buffer;
  v: bigint;
};

export type PrivateKey = Uint8Array | bigint;

export type PublicKey = {
  key: Uint8Array;
  scheme: SignatureScheme;
};

export type SecretKey = Uint8Array | bigint;

export enum KeyringTypes {
  SIMPLE = 'Simple Key Pair',
  HD = 'HD Key Tree',
}

export type KeyMetadata = {
  [prop: string]: unknown;
};

export type State = {
  [prop: string]: unknown;
};

export type SerializedHdKeyringState = {
  mnemonic: number[];
  numberOfKeys: number;
  hdPath?: string;
};

export type KeyringOptions = {
  mnemonic?: Buffer | string | Uint8Array | number[];
  numberOfKeys?: number;
  hdPath?: string;
};
