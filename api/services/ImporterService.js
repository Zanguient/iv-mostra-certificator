

var XLSX = require('xlsx');
var fs = require('fs-extra');
var mv = require('mv');
var uuid = require('node-uuid');

var itemsPerRum = 1000;
var timePerRum = 3 * 1000;

var restartTime = (20 * 60) * 1000;



exports.importAll = function(){

  ImporterService.getDataToImport(function(err, dataObj){
    if(err) return sails.log.error(err);

    if(dataObj && (dataObj.importProgress < dataObj.length) ){
      var itemsCount = 0;
      var runTo = itemsPerRum;

      // get import progress to resume last importer
      if(dataObj.importProgress){

        itemsCount = dataObj.importProgress;
        runTo = runTo + dataObj.importProgress;
      }

      ImporterService.importOneCertificadoItem(
        dataObj.data[itemsCount],
        dataObj.certificadoTipo,
        afteEachItem
      );

      function afteEachItem(err, lastItem){
        if(err) sails.log.error(err, ' - no item: ', lastItem);

        if( (itemsCount+1) >= dataObj.length){
          // done
          sails.log.info('Done! import on file: ', dataObj.filename);

          dataObj.status = 'imported';
          dataObj.importProgress = dataObj.length;
          dataObj.save();

        }else if(itemsCount <= runTo){
          itemsCount++;
          //console.log('next', dataObj.data[itemsCount]);

          ImporterService.importOneCertificadoItem(
            dataObj.data[itemsCount],
            dataObj.certificadoTipo,
            afteEachItem
          );

        }else{
          sails.log.info('Import file: ' + dataObj.filename + ' is partialy done, requene.');

          dataObj.importProgress = itemsCount;
          dataObj.save(function(err){
            if(err) return sails.log.error(err);

            ImporterService.importQueneNextImport();

          });
        }
      }
    } else {
      // nothing to import the requene
      ImporterService.importQueneNextImport();
    }
  });

}


/**
 * Get one import datafile from database to import on
 * @param  {Function} callback
 * @return {[type]}
 */
exports.getDataToImport = function(callback){

  // try to get current importing data
  ImportData.findOneByStatus('importing').done(function(err, importingData){
    if(err) return callback(err, null);

    // if has one importing data then retume it
    if(importingData){
      callback(err, importingData);
    }else{
      // if dont has one importing data get onde pending data to import
      ImportData.findOneByStatus('pending').done(function(err, pendingData){
        if(err) return callback(err, null);

        if(pendingData){
          // change this file status to importing
          pendingData.status = 'importing';
          pendingData.save(function(err) {
            if(err) return callback(err, null);

            callback(null, pendingData);
          });
        } else {
          // nothing to import
          callback(null, null);
        }
      });
    }
  });
}


/**
 * TODO Add upload suport and filename
 * @param  {[type]} file
 * @return {[type]}
 */
exports.saveFileToImport = function(filepath){

  // run again after 15 minutes
  setTimeout(ImporterService.saveFileToImport, restartTime);

  if(!filepath){
    filepath = sails.config.appPath + '/' + sails.config.paths.excelFilesToImport + '/';
  }

  // affter, check if the folder exists and if dont create
  fs.mkdirp(filepath, function(err){
    if(err) return sails.log.error(err);

    fs.readdir(filepath, function (err, files) {
      if (err) return sails.log.error(err);

      files.forEach( function (file) {
        var parser;
        var splitFile = file.split(".");
        var extension = splitFile[splitFile.length-1];
        if(!extension) {
          return sails.log.error('Importer.saveFileToImport - A extenção do arquivo não foi encontrada no arquivo: ', file);
        }

        if(extension == 'xlsx'){
          parser = 'ExcelService';
        }else{
          return sails.log.error('Não tenho um importador para o arquivo '+file+' com extenção: ', extension);
        }


        parser.parse(filepath + file,function(err, data){


          var importData = {};
          importData.length = data.length;
          importData.filename = file;
          importData.systemFilename = file;
          importData.extension = splitFile[1];
          importData.data = data;
          importData.importToModel = 'User';
          importData.certificadoTipo = splitFile[0];

          ImportData.create(importData).done(function(error, SalvedImportData){
            if(error) sails.log.error('Error on Excel service save importData:', error);

            if(SalvedImportData){
              ImporterService.archiveFile(SalvedImportData ,function(err){
                if(err) return sails.log.error(err);
                sails.log.info('File salved and archived');

              });
            }

          });

        });
      });
    });
  });

}

/**
 * Archive the file in other folder to dont upload to database again
 */
exports.archiveFile = function(importData, callback){

  var oldPath = sails.config.appPath + '/' + sails.config.paths.excelFilesToImport + '/' + importData.systemFilename;
  var fileArchivePath = sails.config.appPath + '/' + sails.config.paths.excelFilesToArchive + '/' + importData.systemFilename;

  mv(oldPath, fileArchivePath, {mkdirp: true}, callback);
}

exports.importQueneNextImport = function(){
  setTimeout(ImporterService.importAll, timePerRum);
}

exports.importOneCertificadoItem = function(data, certificadoTipo, callback){

  if(data && data.CPF){

    var certificado = {};
    certificado.avaible = true;
    certificado.type = certificadoTipo;
    certificado.label = 'Certificado de ' + certificadoTipo;
    certificado.cpf = data.CPF.replace(/[A-Za-z$-.\/\\\[\]=_@!#^<>;"]/g, "");
    certificado.email = data.Email;
    certificado.username = data.Nome;

    Certificado.findOneByCpf(certificado.cpf ).done(function(err, certificadoSalved){
      if(err){
        sails.log.error(err);
        return callback(err, null);
      }

      if(certificadoSalved){
          callback(null, certificadoSalved);
      } else {
        Certificado.create(certificado).done(function(err, certificadoSalved){
          if(err){
            sails.log.error(err);
            return callback(err, null);
          }
          callback(null, certificadoSalved);
        });
      }
    });


  } else {
    //CPF dont found
    callback('O cpf é nescessário para a criação do certificado', null);
  }
}

exports.importOneUserItem = function(data, certificadoTipo, callback){

 if(data && data.CPF){

   var user = {};
   //remove accents from and texto from cpf
   user.cpf = data.CPF.replace(/[A-Za-z$-.\/\\\[\]=_@!#^<>;"]/g, "");
   user.email = data.Email;
   user.fullname = data.Nome;
   user.certificados = [];

   var certificados = {};
   certificados.avaible = true;
   certificados.name = certificadoTipo;
   certificados.label = 'Certificado de ' + certificadoTipo;

   user.certificados.push(certificados);

   User.findOneByCpf(user.cpf).done(function(err, userSalved){
     if(err) return sails.log.error(err);

     if(userSalved){

        if(!userSalved.certificados){
          userSalved.certificados = [];
        }

        var addCertificado = true;

        var i = 1;
        userSalved.certificados.every(function(e) {

          // já tem o certificado na conta do usuário então não faz nada
          if(certificados.name == certificadoTipo){
            doneLoop();
            return false;
          }

          // se chegar no ultimo item do array e não tiver o certificado na conta então
          // adiciona o certificado para o usuário
          console.log('i: ',i,userSalved.certificados.length);
          if(i >= userSalved.certificados.length){
            userSalved.certificados.push(certificadosParticipante);
            userSalved.save(function(err){
              callback();
            });
          }

          i++;
          // continue
          return true;
        });

        function doneLoop(){

        }
     }else{
       User.create(user).done(function(error, newUser){
        if(error) sails.log.error('Error on Excel srevice create user:',user , error);

        callback();
       });
     }

   });
 } else {
    //CPF dont found
    callback();
 }
}


