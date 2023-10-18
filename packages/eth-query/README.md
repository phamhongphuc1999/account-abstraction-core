<h1>
@peter-present/eth-query
</h1>

Simple eth and account abstraction query

## Installation

```shell
npm install @peter-present/eth-query
```

- Or if you use `yarn`

```shell
yarn add @peter-present/eth-query
```

## Usage

- This package supports both eth query and account abstraction query. You can create a eth query object by below command.

```js
const ethQuery = new EthQuery(rpcUrl);
const _balance = await ethQuery.getBalance(address);
```

- If you want to interact with account abstraction query, you can create a account abstraction query

```js
const query = new OperationEthQuery(bundleUrl);
const _hash = query.sendUserOperation(userOperation, entryPoint);
```
