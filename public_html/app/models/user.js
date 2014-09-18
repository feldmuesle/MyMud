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
    return self.findOne().where({'player.nickname' : playerName});
//            .exec(function(err, user){
//      if(err){console.error(err); return;}
//      if(!user){
//          console.log('no user found');
//      }
//      console.log('hello from User.getPlayerbyName: '+user);     
//  });
};


UserSchema.statics.savePlayer = function(playerObj){
  console.log('player_id: '+playerObj.nickname);
  var self = this || mongoose.model('Player');
  self.findOne({player :{'nickname' : playerObj.nickname}}, function(err, user){
      if(err){console.error(err); return;}
      var pl = Player.getPlayer(playerObj);
      console.log(user);
      user.player[0] = pl; 
      user.save(function(err){
         if(err){console.error(err); return;} 
         console.log('player has been saved');
      });
  });
 };

module.exports = mongoose.model('user', UserSchema);

//                User.findOneAndUpdate({_id : userId}, {nickname : nickname}, function(err, user){
//                   if(err){console.error(err); return;}
////                   socket.emit('initialize game');
//                    
//                }); 