/**
 * CertificadoPolicy
 *
 * @module      :: Policy
 * @description :: ...
 * @docs        :: ...
 *
 */
module.exports = function(req, res, next) {

  return next();

  if (req.session.authenticated) {
    return next();
  }

  return res.forbidden('You are not permitted to perform this action.');
};
