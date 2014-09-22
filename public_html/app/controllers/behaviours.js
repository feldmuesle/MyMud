/* 
 Here we have all behaviours; 
 */

var Texter = require('./texter.js');
var Helper = require('./helper_functions.js');

var hits = [
        '%pl hits the %npc on %ng nose.',
        'The %npc hits %pl with a fast fist-combo',
        'Impressingly enough the %npc kicks %pls ass while whisteling a tune.'
    ];


var parrys = [
        'The %npc parries and slaps %pl right on %pg the nose',
        'The %npc parries %pls strike and then stretches gracefully %ng back.'
    ];
    
var pacifist = [
        'The %npc is a pacifist and ducks every time you try to hit %ng.',
        'The %npc is against violence and won\'t battle with you.',
        'The %npc does not like to fight and throws a kiss at you instead while running away from you.',
        'The anti-violence-%npc cries "Ouuuuuouuuch" before you even touched him.'
    ];
    
var eats = [
        'The %npc snatches the %it and munches happily until no crumb is left.',
        'The %npc jumps across the room and catches the %it with %ng teeth before it hits the ground.',
        'The %npc picks up the %it and starts mannerly eating it with a huge fork'
    ];

exports.fight = {
    
    hit : function(self, player){
        var text = Helper.getRandomIndex(hits);
        text = Helper.replaceStringPlayer(text, self, player);
        Texter.write(text, player.socketId); 
    },
    
    parry : function(self, player){
        var text = Helper.getRandomIndex(parrys);
        text = Helper.replaceStringPlayer(text, self, player);
        Texter.write(text, player.socketId);
    },
    
    pacifist: function(self, player){
        var text = Helper.getRandomIndex(pacifist);
        text = Helper.replaceStringPlayer(text, self, player);
        Texter.write(text, player.socketId);
        Texter.write('Fighting '+self.keyword+' is just no fun.', player.socketId);
    }   
};

exports.eat = function(self, player, item){
        console.log('npc eats '+item.keyword);
        var text = Helper.getRandomIndex(eats);
        text = Helper.replaceStringItem(text, self, item);
        Texter.write(text, player.socketId);
};
