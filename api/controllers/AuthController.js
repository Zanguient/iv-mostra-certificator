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

  // get
  forgotPasswordForm: function (req, res, next) {
    res.view('auth/page_auth_forgot_password',{
      errorMessage: null
    });
  },

  // post
  forgotPassword: function (req, res, next) {

    var email = req.param("email");

    if(email){
      User.findOneByEmail(email).done(function(err, user){
        if(err){
          sails.log.error('AuthController.forgotPassword: ', err);
          return next(err);
        }
        if(!user){
          return userNotFount();
        }

        AuthToken.create( {user_id: user.id} ).done(function(error, token) {
        if(error){
          sails.log.error(error);
          return res.serverError(error);
        }

          var passwordResetLink = req.baseUrl + '/auth/'+ user.id + '/recuperar-senha/' + token.token;
          EmailService.sendPasswordResetTokenEmail(user, passwordResetLink, req.baseUrl , function(err, responseStatus){
            if(err) return next(err);


            res.view('auth/page_auth_forgot_password',{
              errorMessage: null,

            });
          });
        });
      });

    }else{
      userNotFount();
    }

    function userNotFount(){
      return res.view('auth/page_auth_forgot_password',{
        errorMessage: 'É nescessário informar um email válido',
      });
    }
  },

  // get
  changePasswordWithTokenForm: function(req, res, next){

    var id = req.param("id");
    var token = req.param("token");

    if(!token || !id){
      return res.redirect('/auth/recuperar-senha');
    }

    validAuthToken(id, token, function(err, result, authToken){
      if (err) {
        return res.send(500, { error: res.i18n("Error") });
      }

      if(result != true){
        return res.redirect('/auth/recuperar-senha');
      }

      User.findOneById(id).done(function(err, user){
        if(err){
          sails.log.error('AuthController.changePasswordWithTokenForm: ', err);
          return next(err);
        }

        if(!user){
          sails.log.error('AuthController.changePasswordWithTokenForm: User not found with id: ', id);
          return next();
        }

        req.logIn(user, function(err){
          if(err){
            sails.log.error(err);
            return next();
          }

          res.view('auth/page_auth_recovery_password',{
            errorMessage: null,
            user: user
          });

        });
      });
    });
  },

  // post
  changePasswordWithToken: function(req, res, next){

  },


  /**
   * Activate a user account with activation code
   */
  activate: function(req, res){
    console.log('Check token');
    console.log('activate Account');
    user = {};
    user.id = req.param('id');

    token = req.param('token');

    console.log('user.id:', user.id);
    console.log('AuthToken:',token);

    var responseForbiden = function (){
      return res.send(403, {
        responseMessage: {
          errors: [
            {
              type: 'authentication',
              message: res.i18n("Forbiden")
            }
          ]
        }
      });
    };

    var validAuthTokenRespose = function (err, result, authToken){
      if (err) {
        return res.send(500, { error: res.i18n("Error") });
      }

      // token is invalid
      if(!result){
        return responseForbiden();
      }

      // token is valid then get user form db
      Users.findOneById(user.id).done(function(err, usr) {
        if (err) {
          return res.send(500, { error: res.i18n("DB Error") });
        }

        // user found
        if ( usr ) {

          // activate user and login
          usr.active = true;
          usr.save(function(err){
            if (err) {
              return res.send(500, { error: res.i18n("DB Error") });
            }

            // destroy auth token after use
            authToken.destroy(function(err) {
              if (err) {
                return res.send(500, { error: res.i18n("DB Error") });
              }

              req.logIn(usr, function(err){
                if(err) return next(err);

                return res.format({
                 'text/html': function(){
                    // TODO add a activation message
                    //res.view( 'home/index.ejs');
                    //res.redirect('/user/:id/activation-success');
                    res.redirect('/');
                 },

                 'application/json': function(){
                    console.log('send result here ....');
                    res.send(200, usr);
                 }
                });
              });

            });

          });

        } else {
          // user not found
          return responseForbiden();
        }
      });
    };

    validAuthToken(user.id, token, validAuthTokenRespose);
  },

  SendPasswordResetToken: function(req, res, next){
    console.log('TODO GetloginResetToken');
    return next();
  }

};


/**
 * Check if a auth token is valid
 * TODO move thius function to AuthToken model
 */
var validAuthToken = function (userId, token, cb) {

  // then get user token form db
  AuthToken.findOneByToken(token).done(function(err, authToken) {
    if (err) {
      return cb(res.i18n("DB Error"), null);
    }

    console.log(authToken);
    // auth token found then check if is valid
    if(authToken){

      // user id how wons the auth token is invalid then return false
      if(authToken.user_id != userId){
        return cb(null, false,{
          result: 'invalid',
          message: 'Token does not belong to this user'
        });
      }

      // TODO check token expiration time
      //
      //

      // authToken is valid
      return cb(null, true, authToken);

    } else {
      // auth token not fount
      return responseForbiden();
    }

  });
};
