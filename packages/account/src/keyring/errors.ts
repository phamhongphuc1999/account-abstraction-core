export enum HDKeyringErrors {
  MissingMnemonic = 'HdKeyring: Missing mnemonic when serializing',
  MissingHdPath = 'HdKeyring: Missing hd path',
  MissingPrivateKey = 'HdKeyring: Missing private key in wallet',
  MissingPublicKey = 'HdKeyring: Missing public key in wallet',

  NoSRPProvided = 'HdKeyring: No secret recovery phrase provided',
  InvalidSRP = 'HdKeyring: Invalid secret recovery phrase provided',
  SRPAlreadyProvided = 'HdKeyring: Secret recovery phrase already provided',

  PublicKeyNotFound = 'HdKeyring: Public key not found in this keyring',
  PublicKeyNotProvided = 'HdKeyring: Must specify public key.',

  DeserializeErrorNumberOfAccountWithMissingMnemonic = 'HdKeyring: Deserialize method cannot be called with an opts value for numberOfAccounts and no menmonic',
}
