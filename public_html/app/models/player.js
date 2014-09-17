/* 
Model for the player
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Texter = require ('../controllers/texter.js');

var PlayerSchema = Schema({
    nickname    :   String,
    guild       :   String,
    location    :   String,
    inventory   :   [{
        type    :   Schema.ObjectId,
        ref     :   'Item'
    }],
    socketId    :   String,
    gender      :   String,
    attributes  :   { 
        maxHealth   :   Number,
        health      :   Number,
        hp          :   Number,
        sp          :   Number
    }
});



PlayerSchema.set('toObject', {getters : true});

// set all default-values and set up event-listeners
PlayerSchema.methods.initialize = function(socket){
    console.log('hello from the players init-function');
    var self = this || mongoose.model('Player'); 
    self.socketId = socket.id;
    self.location = 0;
    self.attributes['maxHealth'] = 100;
    self.attributes['health'] = self.attributes['maxHealth'];    
    
    self.setListeners(socket);       
};

PlayerSchema.methods.savePlayer = function(){
    User.findOne().where({'player.nickname' : player.nickname}, function(err, user){
        if(err){console.error(err); return;}
        user.player[0].attributes['health'] = player.attributes['health'];
        user.save(function(err){
           if(err){console.error(err); return;} 
           console.log('player has been saved');
        });
    });   
};

PlayerSchema.methods.setListeners = function(socket){
    
    var self = this || mongoose.model('Player'); 
    
    // set up listener
    self.on('regen', function(){
        var self = this || mongoose.model('Player'); 
        Texter.updatePlayer(self);
        setTimeout(function(){
            self.attributes['health'] = self.attributes['maxHealth'];
            Texter.updatePlayer(self);
            Texter.write(self.nickname+' has regenerated.',self.socketId);
            
        },5000);
        console.log('player regenerating: '+self.attributes['health']);
    }); 
};

PlayerSchema.methods.write = function(message){
    console.log('hello from methods.write: '+message);
    
    this.emit('write', {'message'   : message});
};

PlayerSchema.statics.getPlayer = function (player){
    console.log('hello from savePlayer');
    var PlayerModel = this || mongoose.model('Player');
    var pl = new PlayerModel();
    pl.nickname = player.nickname;
    pl.guild = player.guild;
    pl.location = player.location;
    pl.gender = player.gender;
    pl.inventory = player.inventory;
    pl.socketId = player.socketId;    
    pl.attributes['maxHealth'] = player.attributes.maxHealth;
    pl.attributes['health'] = player.attributes.health;
    pl.attributes['hp'] = player.attributes.hp;
    pl.attributes['sp'] = player.attributes.sp;
    console.log('hello from get player '+pl);
    return pl;
};

//PlayerSchema.methods.setAttribute = function (attr,val){
//    var self = this;
//    console.log('hello from setAttribute');
//    self.attributes[attr] = val;
//};
//
//PlayerSchema.methods.getAttribute = function(attr) {
//        var self = this;
//        console.log('hello from getAttribute');
//        return typeof self.attributes[attr] != "undefinded" ? self.attributes[attr]:false;
//};


var Player = module.exports = mongoose.model('Player', PlayerSchema);


//PlayerSchema.statics.savePlayer = function (player, callback){
//    console.log('hello from savePlayer');
//    var PlayerModel = this || mongoose.model('Player');
//    var pl = new PlayerModel();
//    pl.nickname = player.nickname;
//    pl.guild = player.guild;
//    pl.location = player.location;
//    pl.gender = player.gender;
//    pl.inventory = player.inventory;
//    pl.socketId = player.socketId;    
//    pl.attributes.maxHealth = player.attributes.maxHealth;
//    pl.attributes.health = player.attributes.health;
//    pl.attributes.hp = player.attributes.hp;
//    pl.attributes.sp = player.attributes.sp;
//    
//    pl.save(function(err){
//        if(err){
//            console.log('something went wrong when saving a player.');
//            return null; 
//        }
//        return callback(Room._id);
//    });    
//};
//
//PlayerSchema.statics.insertSkills = function (playerId, skills, callback){
//    var PlayerModel = this || mongoose.model('Player');
//    PlayerModel.findOne({_id : playerId}, function(err, player){
//        if(err){
//            console.log(err);
//            return; 
//        }      
//
//        console.log('PlayerId = '+ player._id);
//        console.log('The Skills-array-length id: '+ skills.length);
//        for(var i=0; i< skills.length; i++){
//            player.skillIds.push[skills._id];
//        }
//
//        player.save(function(err2){
//            if(err2){
//                console.log(err2);
//                return;
//            }
//            return callback();
//        });
//    });   
//};



