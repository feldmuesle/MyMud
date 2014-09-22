/* 
Model for Non-person-characters
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./item.js');
var Behaviours = require('../controllers/behaviours.js');
var Texter = require ('../controllers/texter.js');
var Helper = require('../controllers/helper_functions.js');
var Listeners = require('../controllers/npc_listeners.js');

//var autoIncrement = require('mongoose-auto-increment');
var NpcSchema = new Schema({
    id          :   Number,
    keyword     :   String,
//    location    :   {type: Schema.ObjectId, ref:'Room'},
    shortDesc   :   String,
    description :   String,
    gender      :   String,
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

// initialize with config
NpcSchema.methods.initialize = function(config){
    console.log('hello from initialize npc');
    var self = this || mongoose.model('Npc');
    self.id = config.id;
    self.keyword = config.keyword;
//    self.location = config.location; 
    self.attributes = {
        hp      : config.attributes['hp'],
        health  : config.attributes['health'],
        sp      : config.attributes['sp']
    };    
    self.shortDesc = config.shortDesc;
    self.description = config.description;
    self.gender = config.gender;
    self.maxLoad = config.maxLoad;
    self.inventory =[];
    self.pacifist = config.pacifist;
    self.actions = {
        playerEnters    :   config.actions['playerEnters'],
        playerDrops     :   config.actions['playerDrops'],
        playerChat      :   []
    };
    
    for(var i = 0; i< config.actions['playerChat'].length; i++){
        self.actions['playerChat'].push(config.actions['playerChat'][i]);
    }
    console.log('no mapping error');
    for(var i = 0; i< config.behaviours.length; i++){
        self.behaviours.push(config.behaviours[i]);
    }
    
    console.log('done');
};

NpcSchema.post('init', function(doc){
   console.log('post init'+doc.keyword);
   
      
});

/******* Emitters ******************************************/
NpcSchema.methods.playerEnters = function(player){
    var self = this || mongoose.model('Npc');
    this.emit('playerEnters', player);
};

// give close description on npc
NpcSchema.methods.look = function(player){
    var self = this || mongoose.model('Npc');    
    self.emit('look', player);
};

// text npc's attributes
NpcSchema.methods.prompt = function(player){
    var self = this || mongoose.model('Npc');    
    self.emit('prompt', player);
};


/******* Listeners ********************************************/
NpcSchema.methods.setListeners = function(){
    console.log('Listeners for npc set');
    
    this.getItems();
    var self = this || mongoose.model('Npc');
    
    // get custom listeners
    for(var i=0; i< self.behaviours.length; i++){
        // because of the way js treats variables in loops, 
        // we need to wrap it into a anonymous function
        // otherwise the function will first execute after loop is done
        
        (function(){
            var j = i;
            var listener = self.behaviours[j];
            console.log('loading listener '+listener);
            
            self.on(listener, function(data){
                data['npc'] = self;
                console.log('triggered listener '+listener);
                Listeners.listeners[self.behaviours[j]](data);
                console.log('finished - get next');
            });
            
        })();        
        
    }
    
    
    self.on('playerEnters', function(player){
        
        var rand = Math.floor(Math.random()* 4);
        if(rand == 2){
            console.log('you hit lucky '+rand); 
            var msg = 'There is a '+ self.shortDesc +' in the room.';
            msg = msg +'"'+self.actions['playerEnters']+'" says the '+self.keyword;
            Texter.write(msg, player.socketId);
        }        
    });
    
    self.on('playerDrops', function(player){       
        var msg = 'The '+self.keyword +' says "'+self.actions['playerDrops']+'"';
        Texter.write(msg, player.socketId);
   
    });

    
    self.on('look', function(data){
        // write description
        var rand = Math.floor(Math.random()* self.actions['playerChat'].length);
        Texter.write (self.description, data['socketId']);
        self.emit('prompt', data);
        Texter.write('The ' + self.keyword +' says: "'
                +self.actions['playerChat'][rand]+'"', data['socketId']);
        
        // populate also inventory if there is
        if(self.inventory.length > 0){
            Texter.write('The ' + self.keyword +' has '
                +Helper.grammatize(self.inventory)+' somewhere in his pockets.', data['socketId']);
        } 
    });  
    
    self.on('prompt', function(player){        
        var msg = 'The '+self.keyword+' has '+self.attributes['hp']+' hitpoints, '+self.attributes['sp']+' spellpoints';
        msg = msg + ', while %ng health is '+self.attributes['health'];
        msg = Helper.replaceStringPlayer(msg, self, player);
        Texter.write(msg, player.socketId);
        
    });
    
    self.on('attack', function(player){
        
        // only non-pacifist attack a player
        if(!self.pacifist){
            Behaviours.fight.hit(self, player);
        }
        
    });
    
    self.on('defend', function(player){
        Behaviours.fight.parry(self, player);        
    });
    
    self.on('pacifist', function(player){
        Behaviours.fight.pacifist(self, player); 
    });
};





var NpcModel = mongoose.model('Npc',NpcSchema);
module.exports = NpcModel;


