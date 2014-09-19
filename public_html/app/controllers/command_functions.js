/* 
 * Functions used to handle commands
 */

var Player = require('../models/player.js');
var Npc = require('../models/npc.js');
var User = require('../models/user.js');
var Helper = require('./helper_functions.js');
var Texter = require('./texter.js');



exports.battleNpc = function (action, npc, playerObj, room){
    
    var player = Player.getPlayer(playerObj);
    
    Npc.getInventory(npc['_id']).exec(function(err,npc){
    
        if(err){console.error(err); return;}  
        
        player.setListeners();
        npc.setListeners();
        
        // check if the npc is a pacifist who doesn't fight
        if(npc.pacifist == true){
            Texter.write('You attack the '+npc.keyword, player.socketId);
            npc.emit('pacifist', player);
            return;
        }
        
        if(action == 'attack'){
            Texter.write('You attack the '+npc.keyword, player.socketId);
            Texter.broadcastRoomies(player.nickname +' attacks the '+npc.keyword, player.socketId, room.name);
            npc.emit('defend' ,player);
            
        }else {
            Texter.write('The '+npc.keyword +' attacks '+player.nickname, player.socketId); 
            Texter.broadcastRoomies('The '+npc.keyword +' attacks '+player.nickname, player.socketId, room.name);
            npc.emit('attack' ,player);
        }
        
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
};    
    
    // battle 
exports.battlePlayer = function(attacker, defender, room){
    
        attacker.setListeners();
        defender.setListeners();
        defender.write('we are batteling');
        
        Texter.write('You attack '+defender.nickname, attacker.socketId);
        Texter.broadcastRoomies(attacker.nickname +' attacks '+defender.nickname, attacker.socketId, room.name);
        var attPoints = Math.floor(Math.random()* attacker.attributes.hp +1);
        var defPoints = Math.floor(Math.random()* defender.attributes.hp +1);
        var damage;
        var outcome;
        
        if(attPoints > defPoints){

            damage = Helper.calcDamage(attPoints);
            var health = defender.attributes['health'];
            var newHealth = health - damage;
            defender.attributes['health']= newHealth; 
            outcome = attacker.nickname +' wins the battle. '
                +damage+' points of damage has been done to '+defender.nickname+'.';
            if(damage > 0){
                defender.emit('regen');
            }
            
            
        }else {
            damage = Helper.calcDamage(defPoints);
            var health = attacker.attributes['health'];
            var newHealth = health - damage;
            attacker.attributes['health']= newHealth;
            outcome = defender.nickname +' wins the battle. '
                +damage+' points of damage has been done to '+attacker.nickname+'.';
                
            if(damage > 0){
                attacker.emit('regen');
            }
        }            
        Texter.write(outcome, attacker.socketId); 
        Texter.broadcastRoomies(outcome, attacker.socketId, room.name); 
    };
    
exports.takeItem = function(item, player, room){
    Texter.write('You pick up the '+item.keyword +' and stuff it into your backpack.', player.socketId);
    player.setListeners();
    player.emit('inventory');
    User.addItemToPlayer(player.nickname, item._id);
    
};