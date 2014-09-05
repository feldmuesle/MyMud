/* 
Model for the player
 */

var mongoose = require('mongoose');

//var AttributesSchema = mongoose.Schema({
//    maxHealth   :   Number,
//    health      :   Number,
//    hp          :   Number,
//    sp          :   Number
//    
//});

var ItemSchema = mongoose.Schema({
   name         :   String,
   keywords     :   Array,
   location     :   Number,
   description  :   String,
   shortDesc    :   String,
   maxLoad      :   Number
});

var PlayerSchema = mongoose.Schema({
    nickname    :   String,
    guild       :   String,
    location    :   String,
//    inventory   :   [{
//        type    :   mongoose.Schema.Types.ObjectId,
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
//PlayerSchema.methods.init = function(socket){
//    console.log('hello from init-function');
//    var self = this;
//    self.socketId = socket.id;
//    self.location = 0;
//    self.attributes['maxHealth'] = 100;
//    self.attributes['health'] = self.attributes['maxHealth'];
//    
//    // set up listener
//    self.on('write', function(data){
//        console.log('hello from player.write-listener: '+data['message']);
//        socket.emit('output', data);
//    });       
//};
//
//PlayerSchema.methods.write = function(message){
//    
//    this.emit('write', {'message'   : message});
//};

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
//            var Exit = new ExitModel();
//            console.log('hello from exit-loop.');
//            Exit.description = skills[i].description;
//            Exit.exitId = skills[i].exitId;
//            Exit.direction = skills[i].direction;
//            Exit.goodbye = skills[i].goodbye;
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


//self = this;
//    self.userId = "";
//    self.nickname = socket.pseudo;
//    self.guild = "";
//    self.location = "Lobby";
//    self.inventory = [];
//    self.socketId = socket.id;
//    
//    console.log('hello from player.js, nickname is:' +self.nickname);
//    
//    // attributes of the player
//    self.attributes = {
//      max_health    :   100,
//      health        :   100,
//      experience    :   0,
//      level         :   0,
//      hp            :   10,
//      sp            :   0
//    };
//    
//    // skills the player has
//    self.skills = {};

