/**
 * PDF service
 *
 *
**/

var wkhtmltopdf = require('wkhtmltopdf');
//var fs = require('fs');
var ejs = require('ejs');
var fs = require('fs-extra');

exports.generate = function(user, id, filePath, folder ,callback){

	sails.log.info('Gerando o pdf para: '+user.cpf+' com o certificado de id: '+ id);

  Certificado.findOneById(id).done(function(err, certificado){
    if(err){
      sails.log.error(err);
      return callback(err, null);
    }

    if(certificado){

      PDFService.getTemplate( certificado.data, certificado.type, function(error, template){
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
            'margin-top': 0
          }, function (code, signal) {
            if(code) sails.log.info(code);
            if(signal) sails.log.info(signal);
            callback();
          });
        });

      });

    } else {
      // TODO
    }

  });

}


exports.get = function(callback){
  console.info('get the pdfs here:');
  callback();

}

exports.getTemplate = function(data, templateName, callback){

  var avaibleTemplates = PDFService.getTemplateCofigs();

  if(avaibleTemplates[templateName]){
    var filename = avaibleTemplates[templateName].filename;

    var filePath = sails.config.appPath + '/' + 'arquivos/pdf-templates/' + filename;

    fs.readFile(filePath, 'utf-8', function(error, content) {
      if(error) return callback(error, null);

      var bgFileUrl = sails.getBaseurl() + '/images/certificados/ivmostra.jpg';
      var code = ejs.render(content, {
        data: data,
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
  avaibleTemplates.participante.label = 'participante';
  avaibleTemplates.participante.filename = 'participante.ejs';

  avaibleTemplates.relatoria = {};
  avaibleTemplates.relatoria.label = 'vomissão de Relatoria';
  avaibleTemplates.relatoria.filename = 'relatoria.ejs';

  avaibleTemplates.relatoapresentadonacp = {};
  avaibleTemplates.relatoapresentadonacp.label = 'relato apresentado na CP';
  avaibleTemplates.relatoapresentadonacp.filename = 'relatoapresentadonacp.ejs';

  avaibleTemplates.relatopremiado = {};
  avaibleTemplates.relatopremiado.label = 'relato premiado';
  avaibleTemplates.relatopremiado.filename = 'relatopremiado.ejs';

  avaibleTemplates.curadores = {};
  avaibleTemplates.curadores.label = 'curador';
  avaibleTemplates.curadores.filename = 'curadores.ejs';

  avaibleTemplates.coordenadorescuradoria = {};
  avaibleTemplates.coordenadorescuradoria.label = 'coordenador de curadoria';
  avaibleTemplates.coordenadorescuradoria.filename = 'coordenadorescuradoria.ejs';

  //avaibleTemplates.acolhimento = {};
  //avaibleTemplates.acolhimento.filename = 'acolhimento.ejs';

  avaibleTemplates.oficina = {};
  avaibleTemplates.oficina.label = 'oficina';
  avaibleTemplates.oficina.filename = 'oficina.ejs';

  avaibleTemplates.minicurso = {};
  avaibleTemplates.minicurso.label = 'minicurso';
  avaibleTemplates.minicurso.filename = 'minicurso.ejs';

  avaibleTemplates.espacopics = {};
  avaibleTemplates.espacopics.label = 'atendimento no Espaço Cuide com PICs';
  avaibleTemplates.espacopics.filename = 'espacopics.ejs';

  return avaibleTemplates;
}

exports.getTemplateLabel = function(templateName){
  var avaibleTemplates = PDFService.getTemplateCofigs();

  if(avaibleTemplates[templateName]){
    return avaibleTemplates[templateName].label;
  }
  return false;
}