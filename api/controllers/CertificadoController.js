/**
 * CertificadoController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var fs = require('fs-extra');

module.exports = {
  show: function(req, res){
    var user = {};
    user.cpf = req.param("cpf");

    if(user.cpf){
      User.findOneByCpf(user.cpf).done(function(err, userSalved){
        if(err) return sails.log.error(err);

        if(userSalved) {
          var certificadosDisponiveis = [];

          Certificado.findByUserId(userSalved.id).done(function(err, certificados){
            if(err){
              sails.log.error(err);
              return userNotFound();
            }
            // convert object to array
            res.view('user/show',{
              user: userSalved,
              certificados: certificados
            });
          });

        }else{
          userNotFound();
        }
      });
    }else{
      userNotFound()
    }

    function userNotFound(){
      sails.log.error('User.show: O usuário não foi encontrado');
      req.flash('error', 'O usuário não foi encontrado');
      return res.redirect('/');

    }

  },

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
      req.flash('error', 'Não temos certificados disponíveis para o CPF do usuário informado no sistema');
      sails.log.error('buscarCertificados: Não temos certificados disponíveis para o CPF do usuário informado no sistema: ', user.cpf);
      return res.redirect('/');

    }
  },

  download: function(req, res){
    var HTMLTemplate = 'participante';

    var cpf = req.param("cpf");
    var certificadoNome = req.param("nome");

    var id = req.param("id")

    if(cpf && id){
      User.findOneByCpf(cpf).done(function(err, user){
        if(err){
          sails.log.error(err);
          return notFound();
        }

        if(user){
          var fileFolder = 'arquivos/certificados/'+ user.cpf +'/';
          var fileName = id + '.pdf';
          var filePath =  fileFolder + fileName;

          // Check if file exists
          fs.exists(filePath, function(exists) {
            if (exists) {
              sendDownload(filePath, user.cpf + '-' + fileName);
            }else{
              // if file dont exists generate it
              PDFService.generate(user, id, filePath,fileFolder, function(error){
                if(error){
                  sails.log.error(error);
                  return notFound();
                }

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
      sails.log.error('Certificado.download: O certificado ou usuário não foi encontrado', cpf, certificadoNome);

      req.flash('error', 'O certificado ou usuário não foi encontrado');

      return res.redirect('/');
    }
  }
};
