var should = require('should');
var request = require('supertest');

// fake data
function DataStub () {
  return {
    Nome: 'Alberto Souza',
    type: 'participante',
    CPF: '651.555.164-98',
    Email: 'contato@albertosouza.net'
  };
}

describe('ImporterService', function() {
  // JSON REQUESTS //
  describe('JSON Requests', function() {
    describe('GET', function() {
      it('Should save one Certificado with .importOneCertificadoItem and valid data',function(done){

        var data = DataStub();
        ExcelService.importOneCertificadoItem(data, data.type, function(err, dataSalved){
          if(err) {
            console.error(err);
            return done(err);
          }

          Certificado.findOneByCpf(dataSalved.cpf).done(function(err, certificadoSalved){
            if(err){
              sails.log.error(err);
              return done(err, null);
            }

            should.exist(certificadoSalved.cpf);
            should.exist(certificadoSalved.type);
            should.exist(certificadoSalved.id);
            certificadoSalved.email.should.equal(data.Email);

            done();
          });


        });

      });

    });

  }); // end requests

});
