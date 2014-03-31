/**
 * CertificadoController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var fs = require('fs-extra');

module.exports = {
  buscarCertificados: function(req, res){
    var user = {};
    user.cpf = req.param("cpf");
    if(user.cpf){
      // vemove accents
      user.cpf = user.cpf.replace(/[A-Za-z$-.\/\\\[\]=_@!#^<>;"]/g, "");

      User.findOneByCpf(user.cpf).done(function(err, userSalved){
        if(err) {
          sails.log.error(err);
          return userNotFound();
        }

        if(userSalved) {
          res.redirect('/usuario/' + userSalved.cpf);
        }else{
          userNotFound();
        }
      });
    }else{
      userNotFound();
    }

    function userNotFound(){
      sails.log.error('buscarCertificados: O usuário não foi encontrado');
      return res.badRequest('O usuário não foi encontrado');
    }
  },

  download: function(req, res){
    var HTMLTemplate = 'participante';

    var cpf = req.param("cpf");
    var certificadoNome = req.param("nome");

    if(cpf && certificadoNome){
      User.findOneByCpf(cpf).done(function(err, user){
        if(err) return sails.log.error(err);

        if(user){
          var fileFolder = 'arquivos/certificados/'+ user.cpf +'/';
          var fileName = certificadoNome + '.pdf';
          var filePath =  fileFolder + fileName;

          // Check if file exists
          fs.exists(filePath, function(exists) {
            if (exists) {
              sendDownload(filePath, user.cpf + '-' + fileName);
            }else{
              // if file dont exists generate it
              PDFService.generate(user, certificadoNome, filePath,fileFolder, function(error){
                if(error) return sails.log.error(error);
                sendDownload(filePath,fileName);
              });
            }
          });

          function sendDownload(filePath,filename){
            res.download(filePath,filename);
          }

        }else{
          notFound();
        }

      });
    }else{
      notFound();
    }

    function notFound(){
      sails.log.error('Certificado.download: O certificado ou usuário não foi encontrado');
      return res.badRequest('O certificado ou usuário não foi encontrado');
    }


  }
};
