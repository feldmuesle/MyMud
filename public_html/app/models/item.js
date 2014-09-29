/* Model for items */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Texter = require ('../controllers/texter.js');
var Helper = require('../controllers/helper_functions.js');

//validators
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var ItemSchema = Schema({
   id:   Number,
   keyword:   {type:String, trim:true, validate:valEmpty},
//   location     :   Number,
   description:   {type:String, trim:true, validate:valEmpty},
   shortDesc:  {type:String, trim:true, validate:valEmpty},
   maxLoad:   {type : Number, min: 1, required:true},
   behaviours:   [String]
});

ItemSchema.set('toObject', {getters : true});

//sanitize strings before saving
ItemSchema.pre('save', function(next){
    var self = this || mongoose.model('Item');
    self.keyword = Helper.sanitizeString(self.keyword);
    self.description = Helper.sanitizeString(self.description);
    self.shortDesc = Helper.sanitizeString(self.shortDesc);
    next();
});

// cascade-delete: delete ref. in rooms for npc, when npc is deleted
ItemSchema.post('remove', function(next){
    console.log('hello from npc pre-remove');
    var self = this || mongoose.model('Item');
    self.model('Room').update(
            {inventory: mongoose.Types.ObjectId(self._id)},
            {$pull: {inventory : mongoose.Types.ObjectId(self._id)}},
            {multi:true},
            function(err,next){
                if(err){console.error(err); return;}                
                next;
            }
            );
});

// cascade-delete: delete ref. in rooms for npc, when npc is deleted
ItemSchema.post('remove', function(next){
    console.log('hello from npc pre-remove');
    var self = this || mongoose.model('Item');
    self.model('Npc').update(
            {inventory: mongoose.Types.ObjectId(self._id)},
            {$pull: {inventory : mongoose.Types.ObjectId(self._id)}},
            {multi:true},
            function(err,next){
                if(err){console.error(err); return;}                
                next;
            }
            );
});

// create and save items in db
ItemSchema.statics.createItemsInDb = function(configs){
    console.log('this many items '+configs.lenght);
    for(var i=0; i< configs.length; i++){
        var ItemModel = this || mongoose.model('Item');
        var item = new ItemModel();
        item.initialize(configs[i]);

        item.save(function(err){
           if(err){console.error(err); return;}
           console.log('item has been saved');
        });
        
    }    
};

// get the inventory of npc(param: keeper)
ItemSchema.statics.getInventoryOf = function (keeper){
    var self = this || mongoose.model('Item');
    return self.find({'_id':{$in:keeper.inventory}});
};

// set all the listeners
ItemSchema.methods.setListeners = function(){
    
    var self = this || mongoose.model('Item');
    
    self.on('look', function(data){
        Texter.write (self.description, data['socketId']);
    });
    
    self.on('take', function(data){
       console.log('you want to take '+self.keyword+ '?'); 
    });
};

ItemSchema.methods.initialize = function(config){
    
    var self = this || mongoose.model('Item');
    self.id = config.id;
    self.keyword = config.keyword;
    self.description = config.description;    
    self.shortDesc = config.shortDesc;
    self.maxload = config.maxLoad; 
    
    for (var i=0; i<config.behaviours.length; i++){
        self.behaviours.push(config.behaviours[i]);
    }
    return self;
};

ItemSchema.statics.getItem = function(config){
    
    var self = this || mongoose.model('Item');
    return self.findOne({'_id':config._id});
//    var item = new ItemModel();
//    item.id = config.id;
//    item.keyword = config.keyword;
//    item.description = config.description;    
//    item.shortDesc = config.shortDesc;
//    item.maxload = config.maxLoad; 
//    
//    for (var i=0; i<config.behaviours.length; i++){
//        item.behaviours.push(config.behaviours[i]);
//    }
//    return item;
};

var ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;