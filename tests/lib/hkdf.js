define([
  'intern!tdd',
  'intern/chai!assert',
  'client/vendor/sjcl',
  'client/lib/hkdf'
], function (tdd, assert, sjcl, hkdf) {
  with (tdd) {

    // test vectors from RFC5869
    suite('hkdf', function () {

      test('#hkdf vector 1', function () {

        var ikm = sjcl.codec.hex.toBits('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b');
        var salt = sjcl.codec.hex.toBits('000102030405060708090a0b0c');
        var info = sjcl.codec.hex.toBits('f0f1f2f3f4f5f6f7f8f9');

        return hkdf(ikm, info, salt, 42)
          .then(function (result) {
            assert.equal(sjcl.codec.hex.fromBits(result).length, 84);
            assert.equal(sjcl.codec.hex.fromBits(result), '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865');
          });
      });

      test('#hkdf vector 2', function () {

        var ikm = sjcl.codec.hex.toBits('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b');
        var salt = sjcl.codec.hex.toBits('');
        var info = sjcl.codec.hex.toBits('');

        return hkdf(ikm, info, salt, 42)
          .then(function (result) {
            assert.equal(sjcl.codec.hex.fromBits(result).length, 84);
            assert.equal(sjcl.codec.hex.fromBits(result), '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8');
          });
      });

      test('#hkdf empty salt', function () {

        var ikm = sjcl.codec.utf8String.toBits('initialKeyingMaterial');
        var info = sjcl.codec.utf8String.toBits('info');

        return hkdf(ikm, info, undefined, 42)
          .then(function (result) {
            assert.equal(sjcl.codec.hex.fromBits(result).length, 84);
            assert.equal(sjcl.codec.hex.fromBits(result), '5ff4745de6729d5a523337170ab6e12f202c81611bb8cb80e4b44675a16371cadd8e62eebc777b08bf83');
          });
      });

    });
  }
});
