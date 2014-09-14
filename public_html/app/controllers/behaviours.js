/* 
 Here we have all behaviours; 
 */

var Texter = require('./texter.js');
var Helper = require('./helper_functions.js');


var parrys = [
    
    'The %npc parries %pl hit and slaps right on the nose',
    'The %npc parries %pls strike and stretches his back.'
];

exports.fight = {
    
    hit : function(self, player){
        
        Texter.write();
        console.log(self.keyword + ' hits '+player.nickname+' on the nose');
        if(self.pacifist == true){
            console.log('this is a pacifist');
        } 
    },
    
    parry : function(self, player){
        var text = Helper.getRandomIndex(parrys);
        text = text.replace('%npc', self.keyword).replace('%pl', player.nickname);
        console.log('parry: '+text);
    }
   
};
