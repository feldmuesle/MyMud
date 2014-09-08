 /* 
 Model for player, also used for login
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var PlayerModel = require('./player.js');

var UserSchema = new mongoose.Schema({
   password     :   {type:String, trim:true },
   email        :   {type:String, trim:true },
   date         :   Date,
   player       :   [PlayerModel.schema]
});

UserSchema.path('date')
        .default(function(){
            return new Date();
        })
        .set(function(v){
            return v == 'now'? new Date() : v;
        });


/*********** methods *******************/
// hash the password
UserSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// check password
UserSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);  
};

module.exports = mongoose.model('user', UserSchema);