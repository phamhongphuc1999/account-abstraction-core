import {
  PrivateKey,
  PublicKey,
  SerializedHdKeyringState,
  SignatureScheme,
  SignatureType,
} from '@peter-present/user-operation-type';
import { HDKey } from '@scure/bip32';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKeyringErrors } from '../errors.js';
import { Keyring } from './keyring.js';
import { getPublicKey, sign, verify } from './signature.js';

// eslint-disable-next-line quotes
const hdPathString = "m/44'/60'/0'/0";
const type = 'Custom HD Key Tree';

export class HDKeyring implements Keyring<SerializedHdKeyringState> {
  type: string;

  hdPath: string = hdPathString;
  #mnemonic: string | undefined | null;
  #hdWallet: HDKey | undefined | null;
  #masterKey: HDKey | undefined | null;
  #derivedKeys: PrivateKey[];
  #decryptionKeys: PrivateKey[];

  constructor() {
    this.type = type;
    this.#derivedKeys = [];
    this.#decryptionKeys = [];
  }

  generateRandomMnemonic() {
    this.#initFromMnemonic(bip39.generateMnemonic(wordlist));
  }

  getPublicKeys(scheme: SignatureScheme): Promise<PublicKey[]> {
    try {
      const publicKeys: PublicKey[] = [];
      this.#derivedKeys.map((key: PrivateKey, index: number) => {
        publicKeys[index] = { key: getPublicKey(key, scheme), scheme: scheme };
      });
      return Promise.resolve(publicKeys);
    } catch (e) {
      throw new Error('Selected signature scheme is not supported!');
    }
  }

  getNumberOfKeys(): Promise<number> {
    return Promise.resolve(this.#derivedKeys.length);
  }

  public async addKeys(numberOfKeys = 1): Promise<PrivateKey[]> {
    if (!this.#masterKey) throw new Error(HDKeyringErrors.NoSRPProvided);
    const oldLen = this.#derivedKeys.length;
    const newKeys: PrivateKey[] = [];
    for (let i = oldLen; i < numberOfKeys + oldLen; i++) {
      const key = this.#masterKey.deriveChild(i).privateKey;
      if (!key) throw new Error(HDKeyringErrors.MissingPrivateKey);
      newKeys.push(key);
      this.#derivedKeys.push(key);
    }
    return Promise.resolve(newKeys);
  }

  public async removeKeys(indexes: number[]): Promise<void> {
    indexes.map((idx) => (this.#decryptionKeys[idx] = BigInt(0)));
  }

  public async serialize(): Promise<SerializedHdKeyringState> {
    if (!this.#mnemonic) throw new Error(HDKeyringErrors.MissingMnemonic);
    const uint8ArrayMnemonic = new TextEncoder().encode(this.#mnemonic);

    return Promise.resolve({
      mnemonic: Array.from(uint8ArrayMnemonic),
      numberOfKeys: this.#derivedKeys.length,
      hdPath: this.hdPath,
    });
  }

  public async deserialize(state: SerializedHdKeyringState): Promise<void> {
    if (state.numberOfKeys && !state.mnemonic) {
      throw new Error(HDKeyringErrors.DeserializeErrorNumberOfAccountWithMissingMnemonic);
    }

    if (this.#masterKey) throw new Error(HDKeyringErrors.SRPAlreadyProvided);
    const mnemonic = new TextDecoder().decode(new Uint8Array(state.mnemonic));
    this.#initFromMnemonic(mnemonic);
    if (state.numberOfKeys) await this.addKeys(state.numberOfKeys);
  }

  public async sign(message: Uint8Array, publicKey: PublicKey): Promise<SignatureType> {
    const privateKey = this.#getPrivateKeyForPublicKey(publicKey);
    return Promise.resolve(sign(message, privateKey, publicKey.scheme));
  }

  public async verify(
    signature: SignatureType,
    message: Uint8Array,
    publicKey: PublicKey,
  ): Promise<boolean> {
    return Promise.resolve(verify(signature, message, publicKey));
  }

  get mnemonic(): number[] {
    if (!this.#mnemonic) throw Error(HDKeyringErrors.MissingMnemonic);
    return Array.from(new TextEncoder().encode(this.#mnemonic));
  }

  /**
   * Sets appropriate properties for the keyring based on the given
   * BIP39-compliant mnemonic.
   *
   * @param mnemonic - A seed phrase represented as a string
   * FIXME consider to support an array of UTF-8 bytes, or a Buffer. Mnemonic input
   * passed as type buffer or array of UTF-8 bytes must be NFKD normalized.
   */
  #initFromMnemonic(mnemonic: string): void {
    if (this.#masterKey) {
      throw new Error(HDKeyringErrors.SRPAlreadyProvided);
    }

    this.#mnemonic = mnemonic;

    const isValid = bip39.validateMnemonic(this.#mnemonic, wordlist);
    if (!isValid) throw new Error(HDKeyringErrors.InvalidSRP);
    const seed = bip39.mnemonicToSeedSync(this.#mnemonic);
    this.#hdWallet = HDKey.fromMasterSeed(seed);
    if (!this.hdPath) throw new Error(HDKeyringErrors.MissingHdPath);
    this.#masterKey = this.#hdWallet.derive(this.hdPath);
  }

  #getPrivateKeyForPublicKey(publicKey: PublicKey): PrivateKey {
    if (publicKey.key.length < 33) throw new Error(HDKeyringErrors.PublicKeyNotProvided);
    const privKey =
      this.#derivedKeys.map((priv) => {
        const pub = getPublicKey(priv, publicKey.scheme);
        if (Buffer.from(pub).toString('hex') == Buffer.from(publicKey.key).toString('hex'))
          return priv;
      })[0] ?? undefined;
    if (privKey === undefined) throw new Error(HDKeyringErrors.PublicKeyNotFound);
    return privKey;
  }
}
