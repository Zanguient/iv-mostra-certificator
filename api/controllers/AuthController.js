// api/controllers/AuthController.js

var passport = require('passport');

module.exports = {

  index: function (req,res) {

    res.redirect('/signup');
  },

  // Signup method GET function
  signupPage: function (req, res) {
    // return index page and let angular.js construct the page
    res.view('home/index');
  },

  /**
   * Login form to respond a get request
   */
  loginPage: function (req, res) {
    res.view('auth/login',{
      errorMessage: ''
    });
  },


  logout: function (req, res) {
    req.logout();
    res.redirect('/');
  },

  login: function (req, res, next) {
      var email = req.param("email");
      var password = req.param("password");

      User.findOneByEmail(email).done(function(err, usr) {
          if (err) {
              res.send(500, { error: res.i18n("DB Error") });
          } else {
              if (usr) {
                  if (usr.verifyPassword(password)) {
                      passport.authenticate('local', function(err, usr, info) {

                        if (err) return next(err);
                        if (!usr) return res.redirect('/login');

                        req.logIn(usr, function(err){
                          if(err) return next(err);
                          res.format({
                           'text/html': function(){
                            // TODO add suport to html requests
                              res.redirect('/usuario/' + usr.cpf);

                           },

                           'application/json': function(){
                              res.send(usr);
                           }
                          });

                          // TODO add suport to oauth tokens
                          //res.redirect('/');
                        });

                      })(req, res, next);

                  } else {

                    res.format({
                     'text/html': function(){
                      // TODO add suport to html requests
                        res.view('auth/login',{
                          errorMessage: res.i18n('Wrong Password')
                        });

                     },

                     'application/json': function(){
                        res.send(400, { error: res.i18n("Wrong Password") });
                     }
                    });

                  }
              } else {
                  res.send(404, { error: res.i18n("User not Found") });
              }
          }
      });
  },

  changePaswordPage: function (req, res) {
    var user = {};
    var cpf = req.param("cpf");

    if(cpf){
      User.findOneByCpf(cpf).done(function(err, user){
        if(err){
          return sails.log.error(err);
        }

        if(user){
          res.view('auth/changePaswordPage',{
            user: user,
            errorMessage: ''
          });
        }else{
          userNotFound();
        }

      });

    }else{
      userNotFound();
    }

    function userNotFound(){
      sails.log.error('User.show: O usuário não foi encontrado');
      return res.badRequest('O usuário não foi encontrado');
    }
  },

  changePasword: function (req, res) {
    var user = {};
    var cpf = req.param("cpf");

    var newPassword = req.param("newPassword");
    var confirmPassword = req.param("confirmPassword");

    if(!cpf){
      userNotFound();
    }


    User.findOneByCpf(cpf).done(function(err, user){
      if(err){
        return sails.log.error(err);
      }

      if(user){
        // validação
        if( !newPassword ){
          return res.view('auth/changePaswordPage',{
            user: user,
            errorMessage: 'O campo "Nova senha" é obrigatório'
          });
        }

        if( !confirmPassword ){
          return res.view('auth/changePaswordPage',{
            user: user,
            errorMessage: 'O campo "confirmar senha" é obrigatório'
          });
        }

        if(newPassword != confirmPassword){
          return res.view('auth/changePaswordPage',{
            user: user,
            errorMessage: 'As senhas são diferentes'
          });
        }

        // se os dados são validor então cria uma nova senha para o user
        user.setPassword(newPassword ,function(err){
          if(err){
            return sails.log.error(err);
          }
          // salva a senha
          user.save( function(err){
            if(err){
              return sails.log.error(err);
            }

            res.redirect('/usuario/' + user.cpf);
          });
        });
      }else{
        userNotFound();
      }

    });

    function userNotFound(){
      sails.log.error('User.show: O usuário não foi encontrado');
      return res.badRequest('O usuário não foi encontrado');
    }
  }

};
