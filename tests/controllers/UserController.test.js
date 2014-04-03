var should = require('should');
var request = require('supertest');

function UserStub () {
  return {
    fullCpf: '439.773.333-30',
    cpf: '43977333330',
    name: "Alberto Souza",
    email: "contato@albertosouza.net"
  };
}

describe('UserController', function() {

  // JSON REQUESTS //
  describe('JSON Requests', function() {
    describe('GET', function() {
      it('/examples should return 200 and examples array');
    });
    describe('POST', function() {
      it('/usuario/:cpf/mudar-senha to not authenticated user should return 403', function (done) {

        var user = UserStub();
        request(sails.hooks.http.app)
        .post('/usuario/'+ user.cpf +'/mudar-senha')
        .set('Accept', 'application/json')

        //.set('X-CSRF-Token', testCsrfToken)
        .send( user )
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function (err, res) {

          if(err) return done(err);

          done();
        });
      });
    });
    describe('PUT', function() {
     it('/examples/:id should return 200 and updated example object');

    });
    describe('DELETE', function() {
      it('/examples/:id should return 200');
    });
  }); // end requests

});
