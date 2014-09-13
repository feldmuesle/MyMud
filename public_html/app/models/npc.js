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
            .populate('inventory').exec(function(err, npc ){
                if(err){console.error(err); return;}
//                console.log('item in '+ npc.keyword+'\'s inventory: '+npc.inventory);
            });
};

NpcSchema.methods.playerEnters = function(player){
    console.log('hello from Npc-emit-playerEnters-Event');
    this.emit('playerEnters', player);
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
                +self.behaviours['playerEnters']+'"', player.socketId);
        
            Texter.write('The ' + self.keyword +' has '
                +grammatize(self.inventory)+' somewhere in his pockets.', player.socketId);
        }
        
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


// order a list of keywords grammatically correct
function grammatize(oArray){
    var length = oArray.length;
    var string = '';
    
    switch(true){
        case(length == 2):{
                string = 'a '+oArray[0].keyword+' and a '+oArray[1].keyword;
                break;  
            }
        case(length >2):{
                for(var i=0; i<length; i++){
                   if(i == length-1){
                       string = string +' and a'+oArray[i].keyword;
                   }else {
                       string = string +'a '+ oArray[i].keyword +', ';
                   } 
                }
            }
        case(length == 1):{
                string = 'a '+oArray[0].keyword;
                break;
        }
    }
    return string;
}