/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {
	//console.log(sails.config.appPath + '/' + sails.config.paths.files_to_import + '/Credenciados.xlsx');
	//console.log(sails.config);
	//var filepath = sails.config.appPath + '/' + sails.config.paths.excelFilesToImport + '/Credenciados.xlsx';
	//console.log(filepath);
 	//ExcelService.parse(filepath);

  setTimeout(ImporterService.importAll, 5000);

  setTimeout(ImporterService.saveFileToImport, 3000);


  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};