/* 
Model for Non-person-characters
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./item.js');
var Behaviours = require('../controllers/behaviours.js');
var Texter = require ('../controllers/texter.js');
var Helper = require('../controllers/helper_functions.js');

//var autoIncrement = require('mongoose-auto-increment');
var NpcSchema = new Schema({
    id          :   Number,
    keyword     :   String,
//    location    :   {type: Schema.ObjectId, ref:'Room'},
    shortDesc   :   String,
    description :   String,
    attributes    : {
            health  :   Number,
            hp      :   Number,
            sp      :   Number
        },
    maxLoad     :   Number,
    pacifist      :   { type:Boolean, default:true},
    inventory   :   [{type:Schema.ObjectId, ref:'Item'}],
    actions   :{
            playerEnters    :   String,
            playerDrops     :   String,
            playerChat      :   [String]
        },
    behaviours      :   [String]
});


NpcSchema.set('toObject', {getters : true});

NpcSchema.statics.createNpcinDB = function(npcConf, items){
    var NpcModel = this || mongoose.model('Npc');
    var npc = new NpcModel();
    npc.initialize(npcConf);
      
        Item.find({'id' : {$in :items}}, function(err,docs){
            if(err){console.error(err); return;};             
            
            for (var i=0; i<docs.length; i++){
                npc.inventory.push(docs[i]._id);
                console.log('pushing '+docs[i]._id);
            }
            
        }).exec()
            .then(function(){
                npc.save(function(err){
                if(err){console.error(err); return;}          
                console.log('npc '+npc.keyword+' has been saved.');
            });
        }); 
    
        
            
   
};

NpcSchema.statics.getInventory = function(objectId){
    var NpcModel = this || mongoose.model('Npc');
    return NpcModel.findOne({'_id':objectId}, function(err, npc){
        if(err){console.error(err); return;}
    }).populate('inventory');
};

NpcSchema.statics.getRoomWithNpcs = function(roomId){
    var RoomModel = this || mongoose.model('Room');
    return RoomModel.findOne({'id':roomId}, function(){
    }).populate('npcs inventory');
};

NpcSchema.methods.getItems = function(){
    return this.model('Npc').findOne({'id': this.id})
            .populate('inventory').exec(function(err, npc ){
                if(err){console.error(err); return;}
//                console.log('item in '+ npc.keyword+'\'s inventory: '+npc.inventory);
            });
};

NpcSchema.methods.playerEnters = function(player){
    console.log('hello from Npc-emit-playerEnters-Event');
    this.emit('playerEnters', player);
};

// give close description on room
NpcSchema.methods.look = function(player){
    var self = this || mongoose.model('Npc');    
    self.emit('look', player);
};

NpcSchema.methods.setListeners = function(){
    console.log('Listeners for npc set');
    
    this.getItems();
    var self = this || mongoose.model('Npc');
    
    self.on('playerEnters', function(player){
        
        var rand = Math.floor(Math.random()* 3);
        if(rand == 2){
            console.log('you hit lucky '+rand); 
            Texter.write('The ' + self.keyword +' says: "'
                +self.actions['playerEnters']+'"', player.socketId);
        
            Texter.write('The ' + self.keyword +' has '
                +Helper.grammatize(self.inventory)+' somewhere in his pockets.', player.socketId);
        }        
    });
    
    self.on('attack', function(player){
        
        var rand = Math.floor(Math.random()* 3);
        if(rand == 2){
            console.log('you hit lucky '+rand); 
            Texter.write('The ' + self.keyword +' says: "'
                +self.actions['playerEnters']+'"', player.socketId);
        
            Texter.write('The ' + self.keyword +' has '
                +Helper.grammatize(self.inventory)+' somewhere in his pockets.', player.socketId);
        }        
    });
    
    self.on('look', function(data){
        // write description
        var rand = Math.floor(Math.random()* self.actions['playerChat'].length);
        Texter.write (self.description, data['socketId']);
        Texter.write('The ' + self.keyword +' says: "'
                +self.actions['playerChat'][rand]+'"', data['socketId']);
        
        // populate also inventory if there is
        if(self.inventory.length > 0){
            Texter.write('The ' + self.keyword +' has '
                +Helper.grammatize(self.inventory)+' somewhere in his pockets.', data['socketId']);
        } 
    });  
    
    self.on('attack', function(player){
        console.log(player['nickname'] +' wants to fight ');
        Behaviours.fight.hit(self, player);
    });
    
    self.on('defend', function(player){
        console.log(player['nickname'] +' wants to fight ');
        Behaviours.fight.parry(self, player);
    });
};

// initialize with config
NpcSchema.methods.initialize = function(config){
    console.log('hello from initialize npc');
    var self = this;
    self.id = config.id;
    self.keyword = config.keyword;
//    self.location = config.location;
    self.attributes = {
        hp      : config.attributes['hp'],
        health  : 100,
        sp      : config.attributes['sp']
    };    
    self.shortDesc = config.shortDesc;
    self.description = config.description;
    self.maxLoad = config.maxLoad;
    self.inventory =[];
    self.actions = {
        playerEnters    :   config.actions['playerEnters'],
        playerDrops     :   config.actions['playerDrops'],
        playerChat      :   []
    };
    
    for(var i = 0; i< config.actions['playerChat'].length; i++){
        self.actions['playerChat'].push(config.actions['playerChat'][i]);
    }
    
    // set up listeners
    this.setListerner();
};



var NpcModel = mongoose.model('Npc',NpcSchema);
module.exports = NpcModel;


