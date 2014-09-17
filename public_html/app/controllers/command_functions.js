/* 
 * Functions used to handle commands
 */

var Player = require('../models/player.js');
var Npc = require('../models/npc.js');
var User = require('../models/user.js');
var Helper = require('./helper_functions.js');
var Texter = require('./texter.js');



exports.battleNpc = function (action, npc, playerObj){
    
    var player = Player.getPlayer(playerObj);
    
    Npc.getInventory(npc['_id']).exec(function(err,npc){
    
        if(err){console.error(err); return;}  
        
        player.setListeners();
        npc.setListeners();
        
        if(action == 'attack'){
            Texter.write(player.nickname +' attacks the '+npc.keyword, player.socketId);
            
        }else {
            Texter.write('The '+npc.keyword +' attacks '+player.nickname, player.socketId);            
        }
        
        npc.emit(action ,player); // dependend if action is attack or defend
        
        var attPoints = Math.floor(Math.random()* player.attributes['hp'] +1);
        var defPoints = Math.floor(Math.random()* npc.attributes['hp'] +1);        
        var damage;
        var outcome;
        
        if(attPoints > defPoints){

            damage = Helper.calcDamage(attPoints);
            var health = npc.attributes['health'];
            var newHealth = health - damage;
            npc.attributes['health']= newHealth; 
            outcome = player.nickname +' wins the battle. '
                +damage+' points of damage has been done to the '+npc.keyword+'.';
            
        }else {
            damage = Helper.calcDamage(defPoints);
            var health = player.attributes['health'];
            var newHealth = health - damage;
            player.attributes['health']= newHealth;
            outcome = 'The '+npc.keyword +' wins the battle. '
                +damage+' points of damage has been done to '+player.nickname+'.';
            player.emit('regen');                      
        }    
        
        Texter.write(outcome, player.socketId); 
        npc.emit('prompt', player);
        
    });
    
    
        
//    var index = getIndexByKeyValue(playersInRoom, 'nickname', defender);
//
//    //check if there's anybody to attack in the room
//    if(index != null){
//        defender = playersInRoom[index];            
//        battle(attacker, defender);
//
//        appendToChat('info','You attack '+defender.nickname);
//    } else {
//        appendToChat('meta','Nobody called '+defender+' you could attack is in this room.');
//    }                
};    
    
    // battle 
exports.battle = function(attacker, defender){
        
        console.log(attacker);
        console.log(defender);
        
        Texter.write(attacker.nickname +' attacks '+defender.nickname)
        var msg = attacker.nickname +' attacks '+defender.nickname;
        var attackPoints = Math.floor(Math.random()* attacker.attributes.hp +1);
        var defensePoints = Math.floor(Math.random()* defender.attributes.hp +1);
        var impact = "";
        var damage = 0;
        var stats = "";
        var outcome = "";
        
        
        console.log('attackPoints= '+attackPoints);
        console.log('defensePoints= '+defensePoints);
        
        if(attackPoints > defensePoints){
            defMsg = attacker.nickname+' '+hitHow[hitHowIndex]+'s you '+impact+' '+hitWhere[hitWhereIndex];
            attMsg = 'You attack '+defender.nickname+' and '+impact+' '+hitHow[hitHowIndex]+' the poor soul '+hitWhere[hitWhereIndex];
            var health = defender.attributes['health'];
            var newHealth = health - damage;
            defender.attributes['health']= newHealth;            
            stats = 'attack';
            outcome = attacker.nickname +' wins the battle. '
                +damage+' points of damage has been done.';
            
        }else {
            defMsg = attacker.nickname+'\'s attack was pretty lame and you '+hitHow[hitHowIndex]+' '+impact+' back '+hitWhere[hitWhereIndex]+' instead';
            attMsg = defender.nickname+' parries your lame attack and '+hitHow[hitHowIndex]+'s you '+impact+' '+hitWhere[hitWhereIndex]+' instead';
            var health = attacker.attributes['health'];
            var newHealth = health - damage;
            attacker.attributes['health']= newHealth;
            stats = 'defense';
            outcome = defender.nickname +' wins the battle. '
                +damage+' points of damage has been done.';
        }    
        
        var data = {
            attacker    : attacker,
            defender    : defender,
            message     : msg,
            stats       : stats,
            defMsg      : defMsg,
            attMsg      : attMsg, 
            outcome     : outcome
        };
        
        
    };