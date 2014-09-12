/* 
Model for the player
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayerSchema = Schema({
    nickname    :   String,
    guild       :   String,
    location    :   String,
//    inventory   :   [{
//        type    :   Schema.ObjectId,
//        ref     :   'Item'
//    }],
    socketId    :   String,
    attributes  :   { 
        maxHealth   :   Number,
        health      :   Number,
        hp          :   Number,
        sp          :   Number
    }
});


// set all default-values and set up event-listeners
PlayerSchema.methods.initialize = function(socket){
    console.log('hello from the players init-function');
    var self = this;
    self.socketId = socket.id;
    self.location = 0;
    self.attributes['maxHealth'] = 100;
    self.attributes['health'] = self.attributes['maxHealth'];
    
    // set up listener
    self.on('write', function(data){
        console.log('hello from player.write-listener: '+data['message']);
        socket.emit('output', data);
    }); 
       
};

PlayerSchema.methods.write = function(message){
    
    this.emit('write', {'message'   : message});
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

//var Item = mongoose.model('Item', ItemSchema);
var Player = module.exports = mongoose.model('Player', PlayerSchema);
//module.exports = Item;

PlayerSchema.statics.savePlayer = function (player, callback){
    console.log('hello from savePlayer');
    var PlayerModel = this || mongoose.model('Player');
    var pl = new PlayerModel();
    pl.nickname = player.nickname;
    pl.guild = player.guild;
    pl.location = player.location;
    pl.inventory = player.inventory;
    pl.socketId = player.socketId;
    pl.attributes.maxHealth = player.attributes.maxHealth;
    pl.attributes.health = player.attributes.health;
    pl.attributes.hp = player.attributes.hp;
    pl.attributes.sp = player.attributes.sp;
    
    pl.save(function(err){
        if(err){
            console.log('something went wrong when saving a player.');
            return null; 
        }
        return callback(Room._id);
    });    
};

PlayerSchema.statics.insertSkills = function (playerId, skills, callback){
    var PlayerModel = this || mongoose.model('Player');
    PlayerModel.findOne({_id : playerId}, function(err, player){
        if(err){
            console.log(err);
            return; 
        }      

        console.log('PlayerId = '+ player._id);
        console.log('The Skills-array-length id: '+ skills.length);
        for(var i=0; i< skills.length; i++){
            player.skillIds.push[skills._id];
        }

        player.save(function(err2){
            if(err2){
                console.log(err2);
                return;
            }
            return callback();
        });
    });   
};



