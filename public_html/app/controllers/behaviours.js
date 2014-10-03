/* 
 Here we have all behaviours; 
 */

var Texter = require('./texter.js');
var Helper = require('./helper_functions.js');

var hits = [
        '%pl hits the %npc on %ng nose.',
        'The %npc hits %pl with a fast fist-combo.',
        'Impressingly enough the %npc kicks %pls ass while whisteling a tune.'
    ];


var parrys = [
        'The %npc parries and slaps you right on the nose.',
        'The %npc parries your strike and stretches gracefully %ng back.',
        'The %npc parries and tries to kick your butt.',
        'The %npc tries to duck, but was unfortunately to slow.',
        'The %npc parries and answers your strike with a fast fist-combo.'
    ];
    
var pacifist = [
        'The %npc is a pacifist and ducks every time you try to hit %ng.',
        'The %npc is against violence and won\'t battle with you.',
        'The %npc does not like to fight and throws a kiss at you instead while running away from you.',
        'The anti-violence-%npc cries "Ouuuuuouuuch" before you even touched %ng.'
    ];
    
var surrenders = [
        'The %npcs holds %ng bloody nose and says: \'Enough, I give you my %it if only you stop hitting me.\'',
        'The %npc lower %ng head. \'You are a true master of the martials arts, I bow before you. Take this %it as token for my respect.\'',
        'The %npc cries:\'Enough, please stop this brutality. You\'ll get my %it in return.\''
    ];
    
var eats = [
        'The %npc snatches the %it and munches happily until no crumb is left.',
        'The %npc jumps across the room and catches the %it with %ng teeth before it hits the ground.',
        'The %npc picks up the %it and starts mannerly eating it with a huge fork.',
        'The %npc takes out a huge napking, lights a candle and turns on some soft dinnermusic before scoffing the %it.'
    ];

var trades = [
        'The %npc jumps up and down for sheer joy and won\'t stop. Finally you have to remind %ng of the %it.',
        'The %npc claps into %ng hands and gives you a hug. \'Now you shall get your %it\' %npp says.',
        'The %npc says \'coooool! - in return you\'ll get my %it. This was fun.\'',
        'The %npc screams hysterically and throws a salto mortale. \'This is great, I will reward you with a %it.\''
    ];
var chats = [
        'The %npc steps from one foot to the other and says: ',
        'The %npc waves you close and whispers in your ear: ',
        'Interrupted by small hysterical laughs, the %npc tells you: ',
        'The %npc makes an important face, clears %ng throat a couple of times and says: '
    ];
    
var givesItem = [
    'The %npc rummages in %ng pockets and gives you a %it.',
    'The %npc takes off %ng left shoe and pulls out a %it.',
    'The %npc pats %ng stomach and chokes up a %it.', 
    'The %npc lifts %ng toupee and gives you the %it hidden there.'
]; 
    
var rejects = [
        '\'No way, you can give this to your granny\' says the %npc and shakes %ng head.',
        '\'Now that\'s really a lame offer. Maybe you should think a bit more into direction of a %it\' says the %npc.',
        'The %npc wrinkles %ng forehead and mumbles:\'Sorry, I don\' have any use for this.\'',
        'The %npc stamps with %ng foot on the ground and shouts: \'No, I want a %it.\'',
        'Unfortuanately, the poor %npc has a phobia of this particular thing and runs away.'
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
        Texter.write('Fighting the '+self.keyword+' is just no fun.', player.socketId);
    }   
};

exports.eat = function(self, player, item){
    console.log('npc eats '+item.keyword);
    var text = Helper.getRandomIndex(eats);
    text = Helper.replaceStringItem(text, self, item.keyword);
    Texter.write(text, player.socketId);
};

exports.surrender = function(self, player){
    var rand = Helper.getRandomIndex(surrenders);
    var text = Helper.replaceStringItem(rand, self, self.trade.has.keyword);
    Texter.write(text, player.socketId);
    // give item
    rand = Helper.getRandomIndex(givesItem);
    text = Helper.replaceStringItem(rand, self, self.trade.has.shortDesc);
    Texter.write(text, player.socketId);
};

exports.trade = function(self, player){    
    var text = Helper.getRandomIndex(trades);
    text = Helper.replaceStringItem(text, self, self.trade.has.keyword);
    Texter.write(text, player.socketId);
    // give item
    rand = Helper.getRandomIndex(givesItem);
    text = Helper.replaceStringItem(rand, self, self.trade.has.shortDesc);
    Texter.write(text, player.socketId);
};

exports.reject = function(self, player){
    var text = Helper.getRandomIndex(rejects);
    text = Helper.replaceStringItem(text, self, self.trade.wants.keyword);
    Texter.write(text, player.socketId);
};

exports.chat = function(self, player){
    var rand = Math.floor(Math.random()* self.actions['playerChat'].length);
    var text = Helper.getRandomIndex(chats);
    text += '\''+self.actions.playerChat[rand]+'\'';
    text = Helper.replaceStringPlayer(text, self, player);
    Texter.write(text, player.socketId);
};
