/**
 * Excel service
 *
 *
**/

var XLSX = require('xlsx');
var fs = require('fs-extra');
var mv = require('mv');
var uuid = require('node-uuid');

var itemsPerRum = 1000;
var timePerRum = 3 * 1000;

var restartTime = (20 * 60) * 1000;

exports.importAll = function(){

  ExcelService.getDataToImport(function(err, dataObj){
    if(err) return sails.log.error(err);

    if(dataObj && (dataObj.importProgress < dataObj.length) ){
      var itemsCount = 0;
      var runTo = itemsPerRum;

      // get import progress to resume last importer
      if(dataObj.importProgress){

        itemsCount = dataObj.importProgress;
        runTo = runTo + dataObj.importProgress;
      }

      ExcelService.importOneUserItem(dataObj.data[itemsCount], afteEachItem);

      function afteEachItem(){
        if( (itemsCount+1) >= dataObj.length){
          // done
          sails.log.info('Done! import on file: ', dataObj.filename);

          dataObj.status = 'imported';
          dataObj.importProgress = dataObj.length;
          dataObj.save();

        }else if(itemsCount <= runTo){
          itemsCount++;
          //console.log('next', dataObj.data[itemsCount]);

          // set a random cpf for peaple how dont have
          if(!dataObj.data[itemsCount].CPF){
            dataObj.data[itemsCount].CPF = '10000001' + itemsCount;
          }

          ExcelService.importOneUserItem(dataObj.data[itemsCount], afteEachItem);

        }else{
          sails.log.info('Import file: ' + dataObj.filename + ' is partialy done, requene.');

          dataObj.importProgress = itemsCount;
          dataObj.save(function(err){
            if(err) return sails.log.error(err);

            ExcelService.importQueneNextImport();

          });
        }
      }
    } else {
      // nothing to import the requene
      ExcelService.importQueneNextImport();
    }
  });

}

exports.importQueneNextImport = function(){
  setTimeout(ExcelService.importAll, timePerRum);
}


exports.importOneUserItem = function(data, callback){

 if(data && data.CPF){

   var user = {};
   //remove accents from and texto from cpf
   user.cpf = data.CPF.replace(/[A-Za-z$-.\/\\\[\]=_@!#^<>;"]/g, "");
   user.email = data.Email;
   user.fullname = data.Nome;
   user.certificados = [];

   var certificadosParticipante = {};
   certificadosParticipante.avaible = true;
   certificadosParticipante.name = 'participante';
   certificadosParticipante.label = 'Certificado de Participante';

   user.certificados.push(certificadosParticipante);

   User.findOneByCpf(user.cpf).done(function(err, userSalved){
     if(err) return sails.log.error(err);

     if(userSalved){

        if(!userSalved.certificados){
          userSalved.certificados = {};
        }

        if(!userSalved.certificados){
          userSalved.certificados = [];
        }

        userSalved.certificados.push(certificadosParticipante);


        userSalved.save();
        callback();

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
 * Parse one excel file and return as object
 *
 * @TODO add suport for multiples sheets in same file
 *
 * @param  {string}   excel_file
 * @param  {Function} callback
 */
exports.parse = function(excel_file, callback){

  var xlsx = XLSX.readFile(excel_file);
  var sheet_name_list = xlsx.SheetNames;
  var sheet_count_index = xlsx.SheetNames.length - 1;
  var sheetData =
  xlsx.SheetNames.forEach(function(sheetName, i) {
    var sheetObj = XLSX.utils.sheet_to_row_object_array(xlsx.Sheets[sheetName]);

    if(sheet_count_index >= i){
      afterGetData(null, sheetObj);
    }

  });

  // return only one data object
  function afterGetData(err, data){
      callback(err, data);
  };
}

/**
 * TODO Add upload suport and filename
 * @param  {[type]} file
 * @return {[type]}
 */
exports.saveFileToImport = function(){
  //var file = 'Credenciados.xlsx';

  var filepath = sails.config.appPath + '/' + sails.config.paths.excelFilesToImport + '/';

  // affter, check if the folder exists and if dont create
  fs.mkdirp(filepath, function(err){
    if(err) return sails.log.error(err);

    fs.readdir(filepath, function (err, files) {
      if (err) return sails.log.error(err);

      files.forEach( function (file) {
        ExcelService.parse(filepath + file,function(err, data){

          var importData = {};
          importData.length = data.length;
          importData.filename = file;
          importData.systemFilename = file;
          importData.extension = 'xlsx';
          importData.data = data;
          importData.importToModel = 'User';

          ImportData.create(importData).done(function(error, SalvedImportData){
            if(error) sails.log.error('Error on Excel service save importData:', error);

            if(SalvedImportData){
              ExcelService.archiveFile(SalvedImportData ,function(err){
                if(err) return sails.log.error(err);
                sails.log.info('File salved and archived');

              });
            }

          });

        });
      });
    });
  });

  // run again after 15 minutes
  setTimeout(ExcelService.saveFileToImport, restartTime);
}

/**
 * Archive the file in other folder to dont upload to database again
 */
exports.archiveFile = function(importData, callback){

  var oldPath = sails.config.appPath + '/' + sails.config.paths.excelFilesToImport + '/' + importData.systemFilename;
  var fileArchivePath = sails.config.appPath + '/' + sails.config.paths.excelFilesToArchive + '/' + importData.systemFilename;

  mv(oldPath, fileArchivePath, {mkdirp: true}, callback);
}

