define([
  'intern!tdd',
  'intern/chai!assert',
  'client/FxAccountClient',
  'client/lib/request',
  'components/p/p',
  'intern/node_modules/dojo/has!host-node?intern/node_modules/dojo/node!xmlhttprequest'
], function (tdd, assert, FxAccountClient, Request, p, XHR) {

  with (tdd) {
    suite('fxa client', function () {
      var client;
      var baseUri = 'http://127.0.0.1:9000/v1';
      var xhr = XHR ? XHR.XMLHttpRequest : undefined;
      var restmailClient = new Request('http://restmail.net', xhr);

      before(function () {
        // use an xhr shim in node.js
        client = new FxAccountClient(baseUri, { xhr: xhr });
      });

      test('#create account (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        return client.signUp(email, password)
          .then(function (res) {
            assert.ok(res.uid);
          });
      });

      test('#sign in (async)', function () {
        var email = "test" + Date.now() + "@restmail.net";
        var password = "iliketurtles";
        return client.signUp(email, password)
          .then(function (res) {
            return client.signIn(email, password);
          })
          .then(function (res) {
            assert.ok(res.sessionToken);
          });
      });

      test('#verify email', function () {
        var user = 'test3' + Date.now();
        var email = user + '@restmail.net';
        var password = 'iliketurtles';
        var uid;

        return client.signUp(email, password)
          .then(function (result) {
            uid = result.uid;
            return waitForEmail(user);
          })
          .then(function (emails) {
            var code = emails[0].html.match(/code=([A-Za-z0-9]+)/)[1];
            return client.verifyCode(uid, code);
          });
      });

      // utility function that waits for a restmail email to arrive
      function waitForEmail(user) {
        return restmailClient.send('/mail/' + user, 'GET')
          .then(function(result) {
            if (result.length > 0) {
              return result;
            } else {
              var deferred = p.defer();

              setTimeout(function() {
                waitForEmail(user)
                  .then(function(emails) {
                    deferred.resolve(emails);
                  }, function(err) {
                    deferred.reject(err);
                  });
              }, 1000);
              return deferred.promise;
            }
          });
      }

    });
  }
});
