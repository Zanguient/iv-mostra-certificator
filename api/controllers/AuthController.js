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
  }

};
