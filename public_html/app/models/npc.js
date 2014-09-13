/* 
Model for Non-person-characters
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Item = require('./item.js');
var Texter = require ('../controllers/texter.js');

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
    behaviours   :{
            playerEnters    :   String,
            playerDrops     :   String,
            playerChat      :   [String]
        },
    skills      :   [String]
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
    NpcModel.findOne({'_id':objectId}, function(err, npc){
        if(err){console.error(err); return;}
    }).populate('inventory').exec(function(err, npc){
        if(err){console.error(err); return;}
        console.log('Npc.getInventory: '+npc);
        return npc;
    });
};

NpcSchema.methods.getItems = function(){
    return this.model('Npc').findOne({'id': this.id})
            .populate('inventory').exec(function(err, items ){
                if(err){console.error(err); return;}
                console.log('item in'+ this.keyword+'\'s inventory: '+items);
            });
};

NpcSchema.methods.playerEnters = function(){
    console.log('hello from Npc-emit-testEvent');
    this.emit('playerEnters');
};

NpcSchema.methods.setListeners = function(){
    console.log('Listeners for npc set');
    var self = this || mongoose.model('Npc');
    self.on('playerEnters', function(player){
        Texter.write('The ' + self.keyword +' says: "'
                +self.behaviours['playerEnters']+'"', player.socketId);
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
    self.behaviours = {
        playerEnters    :   config.behaviours['playerEnters'],
        playerDrops     :   config.behaviours['playerDrops'],
        playerChat      :   []
    };
    
    for(var i = 0; i< config.behaviours['playerChat'].length; i++){
        self.behaviours['playerChat'].push(config.behaviours['playerChat'][i]);
    }
    
    // set up listeners
    this.setListerner();
};



var NpcModel = mongoose.model('Npc',NpcSchema);
//NpcModel.on('test', function(){
//   console.log('Testevent on NpcModel'); 
//});
//
//var npc = new NpcModel();
//npc.testEvent();

module.exports = NpcModel;

