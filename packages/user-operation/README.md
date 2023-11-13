<h1>
@peter-present/user-operation
</h1>

Package for build user operation

## Installation

```shell
npm install @peter-present/user-operation
```

- Or if you use `yarn`

```shell
yarn add @peter-present/user-operation
```

## Usage

- Main purpose of the package is to build a `user operation`. First, you must create a `UserOperation` object.

```js
const userOperation = new UserOperation(
  account: Account,
  callData: BytesLike,
  paymasterAndData: BytesLike,
  rpcUrl: string,
  chainId: string | number,
);
```

- After having a object, you can create your `user operation`. If you want deploy your account abstraction, you must pass initCode in `build function`.

```js
const rawUserOps = await userOperation.build(entrypointAddress, { initCode });
```
