import { PrivateKey, PublicKey, Signature, SignatureScheme } from './types.js';

export abstract class Keyring<State> {
  readonly type!: string;

  // Return public keys with indexes
  abstract getPublicKeys(scheme: SignatureScheme): Promise<PublicKey[]>;

  // Add new keys to the keyring
  abstract addKeys(numberOfKeys: number): Promise<PrivateKey[]>;

  // Remove an keys from the keyring.
  abstract removeKeys(indexes: number[]): Promise<void>;

  // Serialize the keyring state as a JSON-serializable object.
  abstract serialize(): Promise<State>;

  // Deserialize the given keyring state, overwriting any existing state with the serialized state provided.
  abstract deserialize(state: State): Promise<void>;

  // Export private keys
  abstract exportKeys?(indexes: number[]): Promise<PrivateKey[]>;

  // Sign arbitrary message
  abstract sign(message: Uint8Array, publicKey: PublicKey): Promise<Signature>;

  // Verify signature
  abstract verify(signature: Signature, message: Uint8Array, publicKey: PublicKey): Promise<boolean>;

  // Encrypt arbitrary message
  abstract encrypt?(message: string, publicKey: PublicKey): Promise<string>;

  // Get encryption key
  abstract getEncryptionKey?(permanent: boolean): Promise<PublicKey>;

  // Decrypt arbitrary message
  abstract decrypt?(message: string, deleteKey: boolean): Promise<string>;
}
