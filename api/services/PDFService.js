/**
 * PDF service
 *
 *
**/

var wkhtmltopdf = require('wkhtmltopdf');
//var fs = require('fs');
var ejs = require('ejs');
var fs = require('fs-extra');


exports.generate = function(user, templateName, filePath, folder ,callback){
	sails.log.info('Generationg pdf for'+user.fullname+' of type '+ templateName);

  PDFService.getTemplate(user, templateName, function(error, template){
    if(error) return callback(error, null);

    // affter check if the folder exists
    fs.mkdirp(folder, function(err){
      if (err) return console.error(err);
      wkhtmltopdf(template, {
        output: filePath,
        pageSize: 'A4',
        encoding: 'utf-8',
        orientation: 'Landscape',
        'margin-bottom': 0,
        'margin-left': 0,
        'margin-right': 0,
        'margin-top': 0,
        //'page-width': '500',
        //'page-height' : '500'
      }, function (code, signal) {
        if(code) sails.log.info(code);
        if(signal) sails.log.info(signal);

        callback();
      });
    });

  });


}


exports.get = function(callback){
  console.info('get the pdfs here:');
  callback();

}

exports.getTemplate = function(user, templateName, callback){

  var avaibleTemplates = PDFService.getTemplateCofigs();

  if(avaibleTemplates[templateName]){
    var filename = avaibleTemplates[templateName].filename;

    var filePath = sails.config.appPath + '/' + 'arquivos/pdf-templates/' + filename;

    fs.readFile(filePath, 'utf-8', function(error, content) {
      if(error) return callback(error, null);

      var bgFileUrl = sails.getBaseurl() + '/images/certificados/iv-mostra.jpg';
      console.log(bgFileUrl);
      var code = ejs.render(content, {
        user: user,
        bgFileUrl: bgFileUrl
      });

      callback(null, code);
    });

  }else{
    callback('HTML Template for PDF not found: '+ templateName, null);
  }
}

exports.getTemplateCofigs = function(){
  var avaibleTemplates = {};

  avaibleTemplates.participante = {};
  avaibleTemplates.participante.filename = 'participante.ejs';

  return avaibleTemplates;
}
