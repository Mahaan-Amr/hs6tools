import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { acceptsShippingMethod } from '../src/lib/shipping-policy';

test('checkout rejects legacy shipping codes that permit client-supplied charges', () => {
  assert.equal(acceptsShippingMethod('POST'), false);
  assert.equal(acceptsShippingMethod('TIPAX'), false);
  assert.equal(acceptsShippingMethod('EXPRESS'), false);
  assert.equal(acceptsShippingMethod('cm12345678901234567890123'), true);
});
