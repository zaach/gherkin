define(['./lib/request', './vendor/sjcl'], function (Request, sjcl) {
  'use strict';

  function str2hex(str) {
    return sjcl.codec.hex.fromBits(sjcl.codec.utf8String.toBits(str));
  }

  function deriveHawkCredentials(tokenHex, context, size) {
    var token = hex2bits(tokenHex);
    hkdf(token, undefined, PREFIX_NAME + context, size || 2 * 32);
      .then(function(out) {
        return {
          algorithm: "sha256",
          key: out.slice(32, 64),
          extra: out.slice(64),
          id: CommonUtils.bytesAsHex(out.slice(0, 32))
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
    return this.request.send("/recovery_email/status", "GET", null, {
      uid: uid,
      code: code
    });
  };

  return FxAccountClient;
});


