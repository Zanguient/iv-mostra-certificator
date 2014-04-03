/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

// bcrypt for password encrypt
var bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;

module.exports = {

	attributes: {
    username: {
      type: 'string'
    },

		cpf: {
			type: 'string',
      unique: true
		},
    originalCpf: {
      type: 'string'
    },
		email: {
			type: 'string'
		},

		fullname: {
			type: 'string'
		},

    birthDate: {
      type: 'date'
    },

    avatarId: {
      type: 'STRING'
    },

    password: {
      type: 'string'
    },

    active: {
      type: 'boolean',
      defaultsTo: false
    },

    isAdmin: {
      type: 'boolean',
      defaultsTo: false
    },

    isModerator: {
      type: 'boolean',
      defaultsTo: false
    },

		certificados: {
			type: 'json'
		},


    // Override toJSON instance method
    // to remove password value
    toJSON: function() {
      var obj = this.toObject();
      delete obj.password;
      return obj;
    },

    // Password functions
    setPassword: function (password, done) {
        var _this = this;
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return done(err);

            // hash the password along with our new salt
            bcrypt.hash(password, salt, function(err, crypted) {
                if(err) return next(err);

                _this.password = crypted;
                done();
            });
        });
    },

    verifyPassword: function (password) {
    	if(password && this.password){
	      var isMatch = bcrypt.compareSync(password, this.password);
	      return isMatch;

    	}else{
    		return false;
    	}

    },

    changePassword: function(user, oldPassword, newPassword, next){
      user.updateAttribute( 'password', newPassword , function (err) {
        console.log('travo');
        if (!err) {
            next();
        } else {
            next(err);
        }
      });
    }

	},

  // Lifecycle Callbacks
  beforeCreate: function(user, next) {
    if(user.cpf){
      // save original cpf
      user.originalCpf = user.cpf;
      // remove accents and trash from cpf
      user.cpf = user.cpf.replace(/[A-Za-z$-.\/\\\[\]=_@!#^<>;"]/g, "");
    }


  	if(!user.password){
			return next();
  	}

    // Create new user password before create
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      // hash the password along with our new salt
      bcrypt.hash(user.password, salt, function(err, crypted) {
        if(err) return next(err);

        user.password = crypted;
        next();
      });
    });
  }
};
