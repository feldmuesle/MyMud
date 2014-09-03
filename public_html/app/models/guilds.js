/* 
 This class is for defining the guilds a player can choose
 */
var mongoose = require('mongoose');

var GuildSchema = new mongoose.Schema({
    name    : String,
    hp      : Number, 
    sp      : Number 
});

module.exports = mongoose.model('guild', GuildSchema);

// get some guilds into the database
//var warrior = new Guild({
//    name    :'warrior',
//    hp      : 20,
//    sp      :  0 
//});
//
//var dwarf = new Guild({
//    name    :'dwarf',
//    hp      : 15,
//    sp      :  3 
//});
//
//var elf = new Guild({
//    name    :'elf',
//    hp      : 12,
//    sp      :  7 
//});
//
//var wizard = new Guild({
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




