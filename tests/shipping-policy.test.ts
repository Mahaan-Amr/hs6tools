import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { shippingCharge, DEFAULT_FREE_SHIPPING_THRESHOLD } from '../src/lib/shipping-policy';

test('shipping is free only above the threshold', () => {
  assert.equal(DEFAULT_FREE_SHIPPING_THRESHOLD, 250_000_000);
  assert.equal(shippingCharge(250_000_000, 250_000_000, 500_000), 500_000);
  assert.equal(shippingCharge(250_000_001, 250_000_000, 500_000), 0);
  assert.equal(shippingCharge(1, 250_000_000, 500_000), 500_000);
});
