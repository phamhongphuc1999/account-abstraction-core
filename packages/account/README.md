<h1>
@peter-present/account
</h1>

Package aim to creating account abstraction

## Installation

```shell
npm install @peter-present/account
```

- Or if you use `yarn`

```shell
yarn add @peter-present/account
```

## Usage

### Create your wallet

```js
const wallet = new Wallet({
  rpcUrl: 'your-rpc',
  networkConfig,
});
```

### Create keyring

```js
walletInfo = await wallet.createKeyring(PASSWORD, walletInfo);
```

### Create a account

```js
const account = await wallet.addAccount(AccountType.EVM);
```
