import test from 'ava';
import { Muta, utils } from 'muta-sdk';
import { BigNumber } from '@mutajs/shared';
import { AssetService } from './AssetService';

const toHex = utils.toHex;

const muta = new Muta();

const client = muta.client();
const account = Muta.accountFromPrivateKey(
  '0x2b672bb959fa7a852d7259b129b65aee9c83b39f427d6f7bded1f58c4c9310c2',
);

test('AssetService with binding', async t => {
  const service = new AssetService(client, account);

  const supply = new BigNumber('9223372036854775808'); // 1 << 63

  const receipt = await service.create_asset({
    name: Math.random().toString(),
    precision: 0,
    supply,
    symbol: Math.random().toString(),
  });

  const createdAsset = receipt.response.response.succeedData;

  t.is(toHex(createdAsset.issuer), toHex(account.address));
  const assetId = createdAsset.id;

  const {
    succeedData: { balance },
  } = await service.get_balance({
    asset_id: assetId,
    user: createdAsset.issuer,
  });
  t.true(supply.isEqualTo(balance));

  const to = '0x2000000000000000000000000000000000000000';

  await service.transfer({
    asset_id: assetId,
    to,
    value: 500,
  });

  const {
    succeedData: { balance: balance2 },
  } = await service.get_balance({
    asset_id: assetId,
    user: to,
  });
  t.is(balance2, 500);
});
