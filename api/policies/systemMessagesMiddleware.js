/**
 * systemMessagesMiddleware
 *
 * @module      :: Middleware
 * @description :: Get and set local scope messages variables from flash
 *
 */
module.exports = function(req, res, next) {
  console.log('no message middleware');
  var success = req.flash('success');
  var info = req.flash('info');
  var warning = req.flash('warning');
  var error = req.flash('error');

  if(!req.variables)
    req.variables = {};

  if(!req.variables.messages){
    req.variables.messages = {
      success: success,
      info: info,
      warning: warning,
      error: error,
    };
  }


  return next();
};
