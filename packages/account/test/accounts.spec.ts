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
import { Wallet } from '../src';
import { Signatures } from '../src/keyring';

describe('Account Package', async () => {
  const wallet = new Wallet({
    networkConfig: {
      chainId: 97,
      addresses: {
        entrypoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        accountFactory: '0x19385cB2E932E2fd40c39c21e7de5a49f53058fF',
        paymaster: '0xEC695d0628e52848C4a3231E5719dFbd29983Bd7',
      },
    },
    rpcUrl: 'https://data-seed-prebsc-2-s2.binance.org:8545/',
  });
  const PASSWORD = 'Test@123';
  let walletInfo: WalletInfo = {
    strategy: WalletStrategy.SIMPLE,
    encrypted: false,
  };
  let firstAccount: string;

  describe('Simple Wallet', () => {
    it('Create account', async () => {
      walletInfo = await wallet.createKeyring(PASSWORD, walletInfo);
      const account = await wallet.addAccount(AccountType.EVM);
      const accounts = await wallet.getAllAccounts();
      assert.equal(accounts.length, 1);
      firstAccount = account.address;

      const message = 'abc@123';
      const sig = await account.sign(new TextEncoder().encode(message));
      assert.equal(await Signatures.verify(sig, toUtf8Bytes(message), account.publicKey), true);

      const mnemonic = new TextDecoder().decode(
        new Uint8Array(walletInfo.state!.keyringState.mnemonic),
      );
      assert.isOk(mnemonic);
    });

    it('Delete accounts', async () => {
      await wallet.removeAllAccounts();
      const accounts = await wallet.getAllAccounts();
      assert.equal(accounts.length, 0);
    });

    it('Recover account', async () => {
      await wallet.restoreKeyring(PASSWORD, walletInfo);
      const account = await wallet.addAccount(AccountType.EVM);
      const accounts = await wallet.getAccounts(AccountType.EVM);

      assert.equal(accounts.length, 1);
      assert.equal(account.address, firstAccount);
    });

    it('Get init code', async () => {
      const accounts = await wallet.getAccounts(AccountType.EVM);
      const initCode = await accounts[0].getInitCode();
      assert.isOk(initCode);
    });

    it('Sign userOp', async () => {
      const accounts = await wallet.getAccounts(AccountType.EVM);
      const account = accounts[0];
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
      const userOpHash = await wallet.getUserOpHash(
        mockUserOp,
        '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
        97,
      );

      const msg =
        Buffer.from('\x19Ethereum Signed Message:\n32').toString('hex') + userOpHash.slice(2);
      const msgHash = keccak_256(Buffer.from(msg));
      assert.isOk(msgHash);

      const sig1 = await wallet.signUserOp(mockUserOp, account);
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
