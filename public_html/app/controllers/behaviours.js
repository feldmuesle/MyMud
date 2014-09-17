/* 
 Here we have all behaviours; 
 */

var Texter = require('./texter.js');
var Helper = require('./helper_functions.js');

var hits = [
        '%pl hits the %npc on %npcg nose.',
        'The %npc hits %pl with a fast fist-combo',
        'Impressingly enough the %npc kicks %pls ass while whisteling a tune.'
    ];


var parrys = [
        'The %npc parries and slaps %pl right on %plg the nose',
        'The %npc parries %pls strike and then stretches gracefully %npcg back.'
    ];

exports.fight = {
    
    hit : function(self, player){
        var text = Helper.getRandomIndex(hits);
        text = Helper.replaceStringNpc(text, self, player);
        Texter.write(text, player.socketId);
        console.log(self.keyword + ' hits '+player.nickname+' on the nose');
        if(self.pacifist == true){
            console.log('this is a pacifist');
        } 
    },
    
    parry : function(self, player){
        var text = Helper.getRandomIndex(parrys);
        text = Helper.replaceStringNpc(text, self, player);
        Texter.write(text, player.socketId);
        console.log('parry: '+text);
    }
   
};
