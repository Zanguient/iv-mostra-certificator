/**
 * CertificadoController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  buscarCertificados: function(req, res){
    var user = {};
    user.cpf = req.param("cpf");

    if(user.cpf){
      // vemove accents
      user.cpf = user.cpf.replace(/[A-Za-z$-.\/\\\[\]=_@!#^<>;"]/g, "");

      User.findOneByCpf(user.cpf).done(function(err, userSalved){
        if(err) return sails.log.error(err);

        if(userSalved) {
          console.log(userSalved);
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
    res.send('gerar e baixar o certificado aqui');
  }
};
