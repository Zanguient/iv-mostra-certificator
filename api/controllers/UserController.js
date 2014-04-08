/**
 * UserController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var passport = require('passport');
var fs = require('fs');

module.exports = {

  index: function (req, res) {

    User.find({})
    .limit(10)
    .sort('name ASC')
    .done(function(err, users) {

      // Error handling
      if (err) {
        return console.log(err);

      // Found multiple users!
      } else {
        res.format({
           'text/html': function(){
            // TODO add suport to html requests
              res.view("home/index.ejs");
            /*
             res.view({
                users: users
              });
            */
           },

           'application/json': function(){
             res.send(users);
           }
        });
      }
    });
  },


  update: function(req, res, next) {
    sails.log('update');
    sails.log(req.params);

    next();
  },

  // getter for current logged in user
  current: function (req, res, next) {
    if(req.isAuthenticated()){

      // TODO change to join after waterline join suport is ready to use
      // if has a avatar get it after send
      if(req.user.avatarId  && !req.user.avatar){
        Images.findOneById(req.user.avatarId).done(function(err, image) {
          req.user.avatar = image;
          respond();
        });
      }else{
        respond();
      }


    }else{
      res.send({user: {}});
    }

    function respond(){
      res.send({user: req.user});
    }
  },

  getAvatar: function (req, res, next) {
    var id = req.param('id');

    if(id){
      User.findOneById(id).done(function(err, user){
        if(err){
          sails.error(err);
          return res.send(500,{'error':err});
        }else if(user && user.avatarId){
          Images.findOneById(user.avatarId).done(function(err, image) {
            if (err) {
                console.log('Error on get image from BD: ',err );
                res.send(404);
            } else {

              // TODO change to image upload path
              var path = 'uploads/' + image.name;

              fs.readFile(path,function (err, contents) {

                if (err){
                  console.log(err);
                  return res.send(404);
                }else{
                  res.contentType('image/png');
                  res.send(contents);
                }

              });
            }
          });
        }else{
          return next();
        }
      });
    } else {
      return next();
    }
  },

  changeAvatar: function (req, res, next) {
    // TODO validate req.files.files
    var  avatarFile = req.files.files[0];

    Images.upload(avatarFile, function(err){
      if(err){
        res.send(
          {
            "files":[],
            "error": err
          }
        );
      } else {
        saveImage();
      }

    });

    function saveImage(){

      var uploadedFile = {};

      uploadedFile.name = avatarFile.newName;
      uploadedFile.originalFilename = avatarFile.originalFilename;
      uploadedFile.size = avatarFile.size;
      uploadedFile.extension = avatarFile.extension;

      // TODO check if are better get mime direct from file
      //uploadedFile.mime = req.files.files.headers['content-type'];
      uploadedFile.user_id = req.user.id;

      Images.create(uploadedFile).done(function(error, salvedFile) {
        if (error) {
          // TODO delete file if ocurs errror here
          console.log(error);
          res.send(500, {error: res.i18n("DB Error") });
        } else {
          //console.log('salved File:',salvedFile);
          salvedFile.thumbnailUrl = 'http://localhost:1333/images/avatars/user-avatar.png';
          salvedFile.url = 'http://localhost:1333/images/avatars/user-avatar.png';
          salvedFile.deleteUrl = '/files/' + salvedFile.id;
          salvedFile.deleteType = 'DELETE';
          console.log(salvedFile);
          saveAvatar(salvedFile);

        }
      });
    }

    function saveAvatar(salvedFile){
      // Lookup a user
      console.log('on user',req.user);
      req.user.avatarId = salvedFile.id;
      req.user.save( function(err) {
        if(err){
          return res.send(500, {err: res.i18n("Error on user avatar save") });
        }

        res.send({
          "user": req.user,
          "avatar": salvedFile
        });
      });
    }
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
      sails.log.error('User.changePasword: O usuário não foi encontrado');
      req.flash('error', 'O usuário não foi encontrado');
      return res.redirect('/');

    }
  }
};
