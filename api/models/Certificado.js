/**
 * Certificado.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
    avaible: {
      type: 'boolean',
      defaultsTo: true
    },
    // user name to add
    type: {
      type: 'string'
    },

    cpf: {
      type: 'string'
    },

    data: {
      type: 'json'
    },

    email: {
      type: 'string'
    },

    userId: {
      type: 'string'
    },

    importerDataId: {
      type: 'string'
    }

	}

};
