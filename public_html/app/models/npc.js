/* 
Model for Non-person-characters
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./item.js');
var Room = require('./room.js');
var Behaviours = require('../controllers/behaviours.js');
var Texter = require ('../controllers/texter.js');
var Helper = require('../controllers/helper_functions.js');
var Listeners = require('../controllers/npc_listeners.js');


//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var NpcSchema = new Schema({
    id         :   Number,
    keyword     :   {type:String, trim:true, lowercase:true, unique:true, validate:valEmpty},
//    location    :   {type: Schema.ObjectId, ref:'Room'},
    shortDesc    :   {type:String, trim:true, validate:valEmpty},
    description  :   {type:String, trim:true, validate:valEmpty},
    gender      :   {type:String, trim:true, default:'male'},
    attributes   : {
            health   :   {type : Number, min:50, max:100, required:true},
            hp      :   {type : Number, min: 1, max: 25, required:true},
            sp      :   {type : Number, min: 0, max: 25, required:true}
        },
    maxLoad     :   {type : Number, min: 1, required:true},
    pacifist    :   { type:Boolean, default:true},
    inventory   :   [{type:Schema.ObjectId, ref:'Item', index:true}],
    trade       :{
            has: {type:Schema.ObjectId, ref:'Item'},
            wants: {type:Schema.ObjectId, ref:'Item'},
            swap: {type:String, trim:true, validate:valEmpty}        
        },
    actions   :{
            playerEnters    :   {type:String, trim:true},
            playerDrops     :   {type:String, trim:true},
            playerChat      : [{type:String, trim:true}]
        },
    behaviours      :   [String]
});

// validation on actions
NpcSchema.path('actions.playerEnters').validate(Helper.valEmpty, 'Action \'{PATH}:\' must not be empty');
NpcSchema.path('actions.playerDrops').validate(Helper.valEmpty, 'Action \'{PATH}:\' must not be empty');
NpcSchema.path('actions.playerChat').validate(Helper.arrayEmpty, 'Action \'{PATH}:\' must not be empty');

NpcSchema.set('toObject', {getters : true});

//sanitize string before saving
NpcSchema.pre('save', function(next){
    console.log('hello from npc-pre-save');
    // sanitize all strings
    var self = this || mongoose.model('Npc');
    var chat = self.actions['playerChat']; 
    var behave = self.behaviours;
    self.keyword = Helper.sanitizeString(self.keyword);
    self.shortDesc = Helper.sanitizeString(self.shortDesc);
    self.description = Helper.sanitizeString(self.description);
    self.gender = Helper.sanitizeString(self.gender);
    self.actions = {
        playerEnters    :   Helper.sanitizeString(self.actions['playerEnters']),
        playerDrops     :   Helper.sanitizeString(self.actions['playerDrops']),
        playerChat      :   []
    };
    console.log('chat-array = '+chat);
    console.log('chat-array = '+chat.length);
    self.behaviours = [];
    for(var i=0; i<chat.length;i++){
        self.actions['playerChat'].push(Helper.sanitizeString(chat[i]));
    }
    
    for(var i=0; i<behave.length;i++){
        self.behaviours.push(Helper.sanitizeString(behave[i]));
    }
    console.log('npc sanitized is'+self);
    next();
});

// cascade-delete: delete ref. in rooms for npc, when npc is deleted
NpcSchema.post('remove', function(next){
    console.log('hello from npc pre-remove');
    var self = this || mongoose.model('Npc');
    self.model('Room').update(
            {npcs: mongoose.Types.ObjectId(self._id)},
            {$pull: {npcs : mongoose.Types.ObjectId(self._id)}},
            {multi:true},
            function(err,next){
                if(err){console.error(err); return;}
                next;
            }
            );
});

// create a new npc and populate inventory with ref-ids to items
NpcSchema.statics.createNpcinDB = function(npcConf, items, cb){
    var NpcModel = this || mongoose.model('Npc');
    var npc = new NpcModel();
    npc.initialize(npcConf);
    console.log('has '+npc.trade['has']);
    console.log('wants '+npc.trade['wants']);
    console.log('swap '+npc.trade['swap']);
    
    if(!items){
      return cb(null, npc);   
    }
    Item.find({'id' : {$in :items}},function(err,docs){
//                if(err){console.error(err); return;};             

        if(npcConf.has== null){
            // npc does not trade, so just push items and return cb
            for (var i=0; i<docs.length; i++){
                npc.inventory.push(docs[i]._id);
                console.log('pushing '+docs[i]._id);
            }
            return cb(err, npc);
        }
        
        // otherwise the npc trades
        for (var i=0; i<docs.length; i++){            
            // insert selected item_id - its also in inventory, so must be in docs
            if(docs[i].id == npcConf.has){ npc.trade['has'] = docs[i]._id;}
            npc.inventory.push(docs[i]._id);
            console.log('pushing '+docs[i]._id);
        }
        console.log('has: '+npcConf.has+' wants: '+npcConf.wants+' swap:'+npcConf.swap);
        // find the item npc wants and add _id to trade
        Item.findOne({'id':npcConf.wants}, function(err, item){
            console.log(item);
            npc.trade['wants']= item._id;
            npc.trade['swap']= npcConf.swap;
            cb(err, npc);
        });
        
    });  
       
};


// update npc in DB
NpcSchema.statics.updateNpc = function(npcConfig, items, cb){
  
    console.log('items in update:'+items);
    var NpcModel = this || mongoose.model('Npc');    
    // find npc in db by id
    NpcModel.findOne({'id':npcConfig.id}, function(err, npc){ 
        if(err){console.error(err); return;};
        
        // initialize with config from form
        npc.initialize(npcConfig);
        
        if(!items){
            cb(err, npc);
        }else {
            Item.find({'id' : {$in :items}},function(err,docs){
//                if(err){console.error(err); return;};             

                if(npcConfig.has== null){
                    // npc does not trade, so just push items and return cb
                    for (var i=0; i<docs.length; i++){
                        npc.inventory.push(docs[i]._id);
                        console.log('pushing '+docs[i]._id);
                    }
                    return cb(err, npc);
                }

                // otherwise the npc trades
                for (var i=0; i<docs.length; i++){            
                    // insert selected item_id - its also in inventory, so must be in docs
                    if(docs[i].id == npcConfig.has){ npc.trade['has'] = docs[i]._id;}
                    npc.inventory.push(docs[i]._id);
                    console.log('pushing '+docs[i]._id);
                }
                console.log('has: '+npcConfig.has+' wants: '+npcConfig.wants+' swap:'+npcConfig.swap);
                // find the item npc wants and add _id to trade
                Item.findOne({'id':npcConfig.wants}, function(err, item){
                    console.log(item);
                    npc.trade['wants']= item._id;
                    npc.trade['swap']= npcConfig.swap;
                    cb(err, npc);
                });
            });            
        }        
    }); 
};

// get Npc by name with all references populated
NpcSchema.statics.getNpcByName = function(keyword){
    var NpcModel = this || mongoose.model('Npc');
    return NpcModel.findOne({'keyword':keyword}).populate('inventory trade.has trade.wants');
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
    self.behaviours = [];
    
    
    // check if there is a chat and if yes, push into array
    if(config.actions['playerChat']){
        for(var i = 0; i< config.actions['playerChat'].length; i++){
            self.actions['playerChat'].push(config.actions['playerChat'][i]);
        }
    }
    
    // check if there is are behaviours and if yes, push into array
    if(config.behaviours){
        for(var i = 0; i< config.behaviours.length; i++){
            self.behaviours.push(config.behaviours[i]);
        }
    }    
};


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
//            console.log('loading listener '+listener);
            
            self.on(listener, function(data){
                data['npc'] = self;
//                console.log('triggered listener '+listener);
                Listeners.listeners[self.behaviours[j]](data);
//                console.log('finished - get next');
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
    
    self.on('trade', function(player){
       Behaviours.trade(self, player); 
    });
    
    self.on('reject', function(player){
       Behaviours.reject(self, player); 
    });
    
    self.on('chat', function(player){
        Behaviours.chat(self, player);
    });
};





var NpcModel = mongoose.model('Npc',NpcSchema);
module.exports = NpcModel;


