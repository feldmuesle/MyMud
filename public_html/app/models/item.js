/* Model for items */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

ItemSchema.statics.getInventoryOf = function (keeper){
  
    ItemSchema.find({'_id':{$in:keeper.inventory}}, function(err, items){
        if(err){console.error(err); return;}    
        console.log('hello from getInventoryOf-function');
        console.log(items);
        
    });
};

ItemSchema.methods.initialize = function(config){
    
    var self = this;
    self.id = config.id;
    self.keyword = config.keyword;
    self.description = config.description;    
    self.shortDesc = config.shortDesc;
    self.maxload = config.maxLoad; 
    
    for (var i=0; i<config.behaviours.length; i++){
        self.behaviours.push(config.behaviours[i]);
    }
    
};

var ItemModel = mongoose.model('Item', ItemSchema);
module.exports = ItemModel;