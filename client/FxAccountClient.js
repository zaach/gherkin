define(['./lib/request', './vendor/sjcl', './lib/hkdf'], function (Request, sjcl, hkdf) {
  'use strict';

  var PREFIX_NAME = "identity.mozilla.com/picl/v1/";
  var bitSlice = sjcl.bitArray.bitSlice;

  function str2hex(str) {
    return sjcl.codec.hex.fromBits(sjcl.codec.utf8String.toBits(str));
  }


  function deriveHawkCredentials(tokenHex, context, size) {
    var token = sjcl.codec.hex.toBits(tokenHex);
    var info = sjcl.codec.utf8String.toBits(PREFIX_NAME + context);

    return hkdf(token, info, undefined, size || 3 * 32)
      .then(function(out) {
        var authKey = bitSlice(out, 8 * 32, 8 * 64);
        var bundleKey = bitSlice(out, 8 * 64);

        return {
          algorithm: "sha256",
          id: sjcl.codec.hex.fromBits(bitSlice(out, 0, 8 * 32)),
          key: authKey,
          bundleKey: bundleKey
        };
      });
  }

  function FxAccountClient(uri, config) {
    if (typeof uri !== 'string') {
      config = uri || {};
      uri = config.uri;
    }
    this.request = new Request(uri, config.xhr);
  }

  FxAccountClient.prototype.signUp = function(email, password) {
    return this.request.send("/raw_password/account/create", "POST", null, {
      email: str2hex(email),
      password: password
    });
  };

  FxAccountClient.prototype.signIn = function(email, password) {
    return this.request.send("/raw_password/session/create", "POST", null, {
      email: str2hex(email),
      password: password
    });
  };

  FxAccountClient.prototype.verifyCode = function(uid, code) {
    return this.request.send("/recovery_email/verify_code", "POST", null, {
      uid: uid,
      code: code
    });
  };

  FxAccountClient.prototype.recoveryEmailStatus = function(sessionToken) {
    return deriveHawkCredentials(sessionToken, "sessionToken",  3 * 32)
      .then(function(creds) {
        return this.request.send("/recovery_email/status", "GET", creds);
      }.bind(this));
  };

  return FxAccountClient;
});


