/**
 * ImportData.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		length: {
			type: 'integer'
		},

		filename: {
			type: 'string'
		},

		systemFilename: {
			type: 'string',
      required: true
		},

		importProgress: {
			type: 'integer',
      defaultsTo: 0
		},

    // pending, importing, current, imported
		status: {
			type: 'string',
			defaultsTo: 'pending'
		},

    extension: {
      type: 'string'
    },

    data: {
      type: 'json',
      required: true
    },

    importToModel: {
      type: 'string'
    },

    certificadoTipo: {
      type: 'string'
    }

	}

};
