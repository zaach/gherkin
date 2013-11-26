define(['./lib/request', './vendor/sjcl'], function (Request, sjcl) {
  'use strict';

  function str2hex(str) {
    return sjcl.codec.hex.fromBits(sjcl.codec.utf8String.toBits(str));
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

  return FxAccountClient;
});


