/**
 * UserController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	show: function(req, res){
    var user = {};
    user.cpf = req.param("cpf");

    if(user.cpf){
      User.findOneByCpf(user.cpf).done(function(err, userSalved){
        if(err) return sails.log.error(err);

        if(userSalved) {
          var certificadosDisponiveis = [];
          console.log(userSalved);

          // convert object to array
          res.view('user/show',{
            user: userSalved
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
      return res.badRequest('O usuário não foi encontrado');
    }

  }
};
