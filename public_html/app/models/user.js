 /* 
 Model for player, also used for login
 */

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Player = require('./player.js');

var UserSchema = new mongoose.Schema({
   password     :   {type:String, trim:true },
   email        :   {type:String, trim:true },
   date         :   Date,
   player       :   [Player.schema]
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

/********* statics ********************/
UserSchema.statics.getPlayerByName = function(playerName){
    var self = this || mongoose.model('User');
    return self.findOne().where({'player.nickname' : playerName}).populate('player.inventory');
};

// save a player in DB
UserSchema.statics.savePlayer = function(playerObj){
  
  var self = this || mongoose.model('User');
  var player = Player.getPlayer(playerObj);
  
  self.findOne().where({'player.nickname' : playerObj.nickname}).exec(function(err, user){
      if(err){console.error(err); return;}  
      
      //replace player with new playerObject
      user.player.pop();
      user.player.push(player);
      user.save(function(err, doc){
         if(err){console.error(err); return;} 
         console.log('player has been saved' +doc);
      });
  });
 };

module.exports = mongoose.model('user', UserSchema);

//                User.findOneAndUpdate({_id : userId}, {nickname : nickname}, function(err, user){
//                   if(err){console.error(err); return;}
////                   socket.emit('initialize game');
//                    
//                }); 