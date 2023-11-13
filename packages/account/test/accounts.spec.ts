/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fromRpcSig } from '@ethereumjs/util';
import { keccak_256 } from '@noble/hashes/sha3';
import {
  AccountType,
  UserOperationStruct,
  WalletInfo,
  WalletStrategy,
} from '@peter-present/user-operation-type';
import { toUtf8Bytes } from 'ethers';
import { assert, describe, it } from 'vitest';
import { AccountPackage, CHAIN_ALIASES } from '../src';
import { Signatures } from '../src/keyring';

describe('Account Package', async () => {
  const ACCOUNT_PACKAGE = new AccountPackage({
    networkConfig: {
      chainId: CHAIN_ALIASES.SEPOLIA,
      addresses: {
        entrypoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        accountFactory: '0x397559AEc4C800F5D1223431c818b83D585AD9ba',
        paymaster: '0x61aB91d929119931d6C6bEd2F09586429DD90fd8',
      },
    },
    rpcUrl: 'https://rpc.sepolia.org',
  });
  const PASSWORD = 'Test@123';
  let walletInfo: WalletInfo = {
    strategy: WalletStrategy.SIMPLE,
    encrypted: false,
  };
  // let mnemonic: string;
  let firstAccount: string;

  describe('Simple Wallet', () => {
    it('Create account', async () => {
      walletInfo = await ACCOUNT_PACKAGE.createKeyring(PASSWORD, walletInfo);
      const account = await ACCOUNT_PACKAGE.addAccount(AccountType.EVM);
      const accounts = await ACCOUNT_PACKAGE.getAllAccounts();
      assert.equal(accounts.length, 1);
      firstAccount = account.address;

      const message = 'asdasdas';
      const sig = await ACCOUNT_PACKAGE.signMessage(message, account);

      assert.equal(
        await Signatures.verify(
          sig,
          toUtf8Bytes(message),
          await ACCOUNT_PACKAGE.getPublicKeyForAccount(account),
        ),
        true,
      );

      const mnemonic = new TextDecoder().decode(
        new Uint8Array(walletInfo.state!.keyringState.mnemonic),
      );
      assert.isOk(mnemonic);
    });

    it('Delete accounts', async () => {
      await ACCOUNT_PACKAGE.removeAllAccounts();
      const accounts = await ACCOUNT_PACKAGE.getAllAccounts();
      assert.equal(accounts.length, 0);
    });

    it('Recover account', async () => {
      await ACCOUNT_PACKAGE.restoreKeyring(PASSWORD, walletInfo);
      const account = await ACCOUNT_PACKAGE.addAccount(AccountType.EVM);
      const accounts = await ACCOUNT_PACKAGE.getAccounts(AccountType.EVM);

      assert.equal(accounts.length, 1);
      assert.equal(account.address, firstAccount);
    });

    it('Get init code', async () => {
      const accounts = await ACCOUNT_PACKAGE.getAccounts(AccountType.EVM);
      const initCode = await ACCOUNT_PACKAGE.getAccountInitCode(accounts[0]);
      assert.isOk(initCode);
    });

    it('Sign userOp', async () => {
      const accounts = await ACCOUNT_PACKAGE.getAccounts(AccountType.EVM);
      const account = accounts[0];
      // const ownerAddress = await ACCOUNT_PACKAGE.getOwnerAddress(account);
      // console.log('Owner', ownerAddress);
      const mockUserOp: UserOperationStruct = {
        sender: '0x' + '0'.repeat(40),
        nonce: 0,
        initCode: '0x',
        callData: '0x',
        callGasLimit: 1000000,
        verificationGasLimit: 100000,
        preVerificationGas: 10000,
        maxFeePerGas: 10000,
        maxPriorityFeePerGas: 20000,
        paymasterAndData: '0x',
        signature: '0x',
      };
      const userOpHash = await ACCOUNT_PACKAGE.getUserOpHash(
        mockUserOp,
        '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        11155111,
      );

      const msg =
        Buffer.from('\x19Ethereum Signed Message:\n32').toString('hex') + userOpHash.slice(2);
      const msgHash = keccak_256(Buffer.from(msg));
      assert.isOk(msgHash);

      const sig1 = await ACCOUNT_PACKAGE.signUserOp(mockUserOp, account);
      const rawSig1 = fromRpcSig(sig1.toString());
      const customSig = {
        r: '0x' + rawSig1.r.toString('hex'),
        s: '0x' + rawSig1.s.toString('hex'),
        v: rawSig1.v,
      };
      assert.isOk(customSig);
    });
  });
});
