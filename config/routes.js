/**
 * Routes
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.routes = {


  // Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, etc. depending on your
  // default view engine) your home page.
  //
  // (Alternatively, remove this and add an `index.html` file in your `assets` directory)
  '/': {
    controller: 'main',
    action: 'index'
  },


  'post /buscar-certificados' : {
    controller: 'certificado',
    action: 'buscarCertificados'
  },

  // usuários

  'get /usuario/:cpf': {
    controller: 'user',
    action: 'show'
  },

  // download one certificado
  'get /usuario/:cpf/certificados/:nome.pdf': {
    controller: 'certificado',
    action: 'download'
  }

  // AUTH
  /*
  ,

  'get /login': {
    controller    : 'auth',
    action        : 'loginPage'
  },

  'post /login': {
    controller    : 'auth',
    action        : 'login'
  },

  '/users/logout': {
    controller    : 'auth',
    action        : 'logout'
  },


  'get /usuario/:cpf/mudar-senha': {
    controller    : 'auth',
    action        : 'changePaswordPage'
  },

  'post /usuario/:cpf/mudar-senha': {
    controller    : 'auth',
    action        : 'changePasword'
  },

  // data importer

  'get /admin/data/importador': {
    controller    : 'importer',
    action        : 'index'
  },

  'get /admin/data/importador/upload-file': {
    controller    : 'importer',
    action        : 'uploadToImportPage'
  },

  'post /admin/data/importador/upload-file': {
    controller    : 'importer',
    action        : 'uploadToImport'
  }
  */

};
