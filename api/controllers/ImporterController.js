/**
 * ImporterDataController.js
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  index: function(req, res, next){

    ImportData.find({})
    //.limit(10)
    .sort('updatedAt DESC')
    .done(function(err, importers) {
      if(err) {
        sails.log.error(err);
        return next();
      }

      if(!importers){

        return res.view('importer/index',{
          importers: []
        });

      }
      delete(importers.data);
      console.log(importers);

      res.view('importer/index',{
        importers: importers
      });


    });
  },

  uploadToImportPage: function(req, res){
    var models = [];

    sails.util.each(sails.models, function(el, i){
      var model = {};

      model.name = i;
      model.attributes = el.definition;
      models.push(model);
    });

    var certificadoTipos = [];

    certificadoTipos.push('participante');


    res.view('importer/uploadToImportPage',{
      errorMessage: '',
      models: models,
      certificadoTipos: certificadoTipos
    });
  },

  uploadToImport: function(req, res){
    var models = [];


    sails.util.each(sails.models, function(el, i){
      var model = {};

      model.name = i;
      model.attributes = el.definition;
      models.push(model);
    });

    res.view('importer/index',{
      errorMessage: '',
      models: models
    });
  }


};
