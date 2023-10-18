import { assert, describe, it } from 'vitest';
import { EthQuery } from '../src';

describe('Eth query package', async () => {
  const ethQuery = new EthQuery('https://bsc-dataseed.binance.org/');
  it('balance of', async () => {
    const _balance = await ethQuery.getBalance('0x871DBcE2b9923A35716e7E83ee402B535298538E');
    assert.isTrue(typeof _balance == 'string');
  });
});
