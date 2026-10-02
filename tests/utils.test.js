import assert from 'node:assert/strict';
import test from 'node:test';
import { convertJsonToCsv, createUuidV4 } from '../src/utils.js';

test('CSV conversion escapes headers, quotes, commas and newlines', () => {
  const csv = convertJsonToCsv([
    { 'first,name': 'Ada', quote: 'x"y', note: 'line one\nline two' },
    { 'first,name': 'Grace', note: 'a,b' },
  ]);

  assert.equal(csv, [
    '"first,name","quote","note"',
    '"Ada","x""y","line one\nline two"',
    '"Grace","","a,b"',
  ].join('\n'));
});

test('CSV conversion supports scalar array entries and empty arrays', () => {
  assert.equal(convertJsonToCsv([1, 'two']), '"value"\n"1"\n"two"');
  assert.equal(convertJsonToCsv([]), '');
  assert.throws(() => convertJsonToCsv({ value: 1 }), /Expected a JSON array/);
});

test('UUID v4 fallback uses cryptographic bytes and sets RFC 4122 version bits', () => {
  const deterministicCrypto = {
    getRandomValues(bytes) {
      bytes.fill(0);
      return bytes;
    },
  };

  assert.equal(createUuidV4(deterministicCrypto), '00000000-0000-4000-8000-000000000000');
});

test('UUID generation fails explicitly without a cryptographic source', () => {
  assert.throws(
    () => createUuidV4({}),
    /Secure random number generation is unavailable/,
  );
});
