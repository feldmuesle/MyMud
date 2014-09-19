/* Model for items */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Texter = require ('../controllers/texter.js');

var ItemSchema = Schema({
   id           :   Number,
   keyword      :   String,
//   location     :   Number,
   description  :   String,
   shortDesc    :   String,
   maxLoad      :   Number,
   behaviours   :   [String]
});

ItemSchema.set('toObject', {getters : true});

// create and save items in db
ItemSchema.statics.createItemsInDb = function(configs){

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