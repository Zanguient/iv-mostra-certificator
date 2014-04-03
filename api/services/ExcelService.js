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

