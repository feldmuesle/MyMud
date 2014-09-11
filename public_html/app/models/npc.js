/* 
Model for Non-person-characters
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//var autoIncrement = require('mongoose-auto-increment');
var NpcSchema = new Schema({
    id          :   Number,
    name        :   String,
//    location    :   {type: Schema.ObjectId, ref:'Room'},
    shortDesc   :   String,
    description :   String,
    health      :   Number,
    hp          :   Number,
    sp          :   Number,
    maxLoad     :   Number,
    pacifist    :   {type:Boolean, default:true}
});

NpcSchema.set('toObject', {getters : true});

NpcSchema.statics.createNpcinDB = function(npcs){
    var NpcModel = this || mongoose.model('Npc');
    
    for(var i=0; i<npcs.length; i++){        
        var npc = new NpcModel();
        npc.initialize(npcs[i]);
        
        npc.save(function(err){
            if(err){console.error(err); return}          
            console.log('npc '+npc.name+' has been saved.');
        });
    }    
};

NpcSchema.methods.testEvent = function(){
    console.log('hello from emit-testEvent');
    this.emit('test');
};

// initialize with config
NpcSchema.methods.initialize = function(config){
    console.log('hello from initialize npc');
    var self = this;
    self.id = config.id;
    self.name = config.name;
//    self.location = config.location;
    self.attributes = {
        hp : config.hp,
        health  : config.health,
        sp      : config.sp
    };    
    self.shortDesc = config.shortDesc;
    self.description = config.description;
    self.maxLoad = config.maxLoad;
    
    // set up listeners
    this.on('test', function(){
        
        console.log('Testevent on NpcModel called by ' + this.name); 
     });
};

var NpcModel = mongoose.model('Npc',NpcSchema);
//NpcModel.on('test', function(){
//   console.log('Testevent on NpcModel'); 
//});
//
//var npc = new NpcModel();
//npc.testEvent();

module.exports = NpcModel;


