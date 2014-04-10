/**
 * Relato.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    avaible: {
      type: 'boolean',
      defaultsTo: true
    },

    title : {
      type: 'string',
      required: true
    },

    authors: {
      type: 'array',
      required: true
    },

    // relato creator //
    userId: {
      type: 'string'
    }

  }

};
