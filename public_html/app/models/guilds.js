/* 
 This class is for defining the guilds a player can choose
 */
var mongoose = require('mongoose');
var Helper = require('../controllers/helper_functions.js');
var valEmpty = [Helper.valEmpty, 'The field \'{PATH}:\' must just not be empty.'];

var GuildSchema = new mongoose.Schema({
    id      : Number,
    name    : {type:String, trim:true, lowercase:true, unique:true, validate:valEmpty},
    hp      : {type : Number, min: 1, max: 25, required:true},
    sp      : {type : Number, min: 0, max: 25, required:true} 
});

GuildSchema.pre('save', function(next){
    console.log('hello from npc-pre-save');
    // sanitize all strings
    var self = this || mongoose.model('Npc');
    self.name = Helper.sanitizeString(self.name);
    next();
});

module.exports = mongoose.model('guild', GuildSchema);

//// get some guilds into the database
//
//var Guild = mongoose.model('guild', GuildSchema);
//var warrior = new Guild({
//    id      : 1,
//    name    :'warrior',
//    hp      : 20,
//    sp      :  0 
//});
//
//var dwarf = new Guild({
//    id      : 2,
//    name    :'dwarf',
//    hp      : 15,
//    sp      :  3 
//});
//
//var elf = new Guild({
//    id      : 3,
//    name    :'elf',
//    hp      : 12,
//    sp      :  7 
//});
//
//var wizard = new Guild({
//    id      : 4,
//    name    :'wizard',
//    hp      : 8,
//    sp      : 10 
//});
//
//var guilds = [warrior,dwarf,elf,wizard];
//
//for(var i=0; i<guilds.length; i++){
//    guilds[i].save(function(err, guild){
//        if(err){return console.error(err);}
//        console.dir(guild);
//    });
//}




