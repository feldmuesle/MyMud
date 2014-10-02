 /* 
 * Functions used to handle commands
 */

var Player = require('../models/player.js');
var Npc = require('../models/npc.js');
var Item = require('../models/item.js');
var User = require('../models/user.js');
var Room = require('../models/room.js');
var Helper = require('./helper_functions.js');
var Texter = require('./texter.js');



exports.battleNpc = function (action, npcObj, playerObj, room){
    console.log('lets battle');
    var player = Player.getPlayer(playerObj);
    var npc = new Npc(npcObj);
        
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
        var diff = attPoints-defPoints;
        damage = Helper.calcDamage(diff);
        var health = npc.attributes['health'];
        var newHealth = health - damage.points;
        npc.attributes['health']= newHealth; 
        console.log('player inventory: '+player.inventory);
        outcome = player.nickname +' wins the battle '
            +'while the '+npc.keyword+' got '+damage.desc+'.';
        Texter.write(outcome, player.socketId);

        // let npc surrender if damage too big and player doesn't have item in inventory yet
        if(newHealth < 70){
            console.log('you hit him bad');
            User.getPlayerByNameSimple(player.nickname).exec(function(err, user){
                if(err){console.error(err); return;}
                
                var player = user.player[0];                
                var itemI = player.inventory.indexOf(npcObj.trade.has._id);
                
                // if item is not already in inventory
                if(itemI <0){
                    npc.emit('surrender', player);            
                    player.addItem(npcObj.trade.has._id);
                    
                    user.save(function(err, user){
                        if(err){console.error(err); return;}
                    });                
                    
                } else {
                    
                    var msg = 'The %npc cries:\' You got already a %it and I have nothing else to give.'
                        +'You are an evil person!\' '
                        +'The %npc gets up and flees. Shame on you for being so brutal.';
                    msg = Helper.replaceStringItem(msg, npc, npcObj.trade.has.keyword);
                    Texter.write(msg, player.socketId);
                } 
                  
            });
        }
//            Texter.updateNpcHealth(JSON.parse(JSON.stringify(npc)), player); //THROWS ERROR, DISCONNECT, DONT KNOW WHY
    }else {
        var diff = defPoints-attPoints;
        damage = Helper.calcDamage(diff);
        var health = player.attributes['health'];
        var newHealth = health - damage.points;
        if(newHealth >= 0){
            player.attributes['health']= newHealth;
            //outcome = 'The '+npc.keyword +' wins the battle while '+player.nickname+' got '+damage.desc +'.';
            outcome = 'The '+npc.keyword +' wins the battle while you loose '+damage.points+'% of your health.';
            
            // give a warning if health is very low
            if(newHealth < 40){
                outcome += 'Another hard strike from '+npc.keyword+' can be lethal in your condition. Maybe you should leave.';
            }            
            Texter.write(outcome, player.socketId);
        
            player.emit('regen');  
            
        }else {
            
            player = player.die();
            User.savePlayer(player);
            player.emit('dead');
            Texter.updatePlayer(player);
            
        }
        
                            
    }    
//    npc.emit('prompt', player);      
};    
    
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
    
exports.takeItem = function(item, player){
    
    // get player from db to get real inventory
    User.getPlayerByName(player.nickname).exec(function(err, user){
        if(err){console.error(err); return;}
        var player = user.player[0];
        
        // check if item already exist in players inventory
        var inventI =  Helper.getIndexByKeyValue(player.inventory, 'keyword', item.keyword);

        if( inventI == null){
            player.inventory.push(item._id);
       
            user.save(function(err, user){
                if(err){console.error(err); return;}
                console.log('user with item has been saved.');
                user.player[0].setListeners();
                user.player[0].emit('take item', item);
                console.log(player);
            });                
        } else {
            var msg = 'You got already a '+ item.keyword+' in your inventory.';  
            Texter.write(msg, player.socketId);
        } 
    });       
};

exports.dropItem = function(item, playerObj, room){
    
    // get player from db to get real inventory
    User.getPlayerByName(playerObj.nickname).exec(function(err, user){
        if(err){console.error(err); return;}
        
        var player = user.player[0];
        // check if item already exist in players inventory
        var inventI =  Helper.getIndexByKeyValue(player.inventory, 'keyword', item);

        if( inventI != null){
            var droppedItem = player.inventory[inventI];
            player.inventory.splice(inventI, 1);
            
            user.save(function(err, user){
               if(err){console.error(err); return;} 
               console.log('drop item, user has been saved.');
               user.player[0].setListeners();
               user.player[0].emit('drop item',droppedItem ); 
            });
            
            // get npcs in room react to this
            Room.getRoomWithNpcs(room.id).exec(function(err,room){
                if(err){console.error(err); return;}

                var npcs = room.npcs;
                
                // check if item is eatable and theres a npc with eat-behaviour
                var eatI = droppedItem.behaviours.indexOf('eatable');
                if(eatI > -1){
                    npcs.forEach(function(npc){  
                        // check npc for eating-behaviour
                        var npcI = npc.behaviours.indexOf('eat');
                        npc.setListeners();
                        if(npcI > -1){
                            npc.emit('eat', {
                                'player': user.player[0],
                                'item'  : droppedItem
                            });
                            return;
                        }                            
                    });
                }else {
                    // get random npc react to drop with custom reaction
                    var rand = Math.floor(Math.random()* npcs.length);
                    npcs[rand].setListeners();
                    npcs[rand].emit('playerDrops', player);
                }
            });
        } else {
            var msg = 'You don\'t have a '+ item +' in your inventory.';  
            Texter.write(msg, player.socketId);
            return;
        } 
        
    });       
};

exports.tradeItem = function(player, room, what, reciever){
  // get player from DB and check if item is in inventory
    User.getPlayerByName(player.nickname).exec(function(err, user){
        if(err){console.error(err); return;}
        
        var player = user.player[0];
        
        // check in inventory
        var itemI = Helper.getIndexByKeyValue(player.inventory, 'keyword', what);
        // if there is a match
        if(itemI != null){

           Room.getRoomWithNpcs(room.id).exec(function(err, room){
               if(err){console.error(err); return;}                           

               // check if there is an npc in the room
               if(room.npcs.length > 0){

                    room.npcs.forEach(function(npc){
                        // if the name matches
                        if(npc.keyword == reciever){
                            
                            // get npc from db and check if the item also matches the one he wants
                            Npc.getNpcByName(npc.keyword).exec(function(err, npc){
                                if(err){console.error(err); return;}

                                if(npc && npc.trade.wants.keyword == what){
                                    // remove item
                                    player.inventory.splice(itemI);
                                    var msg= 'You take the '+what+' out of your backpack and give it to the '+reciever;
                                    Texter.write(msg, player.socketId);
                                    
                                    var hasI = Helper.getIndexByKeyValue(player.inventory, 'keyword', npc.trade.has.keyword);
                                    console.log('player inventory:' +player.inventory);
                                    console.log('hasI '+hasI);
                                    
                                    if (hasI == null){
                                        // add item player recieves from npc
                                        player.inventory.push(npc.trade.has);
                                        
                                        // save player
                                        user.save(function(err, user){
                                            if(err){console.error(err); return;} 
                                            npc.setListeners();
                                            npc.emit('trade', player);
                                            var msg = npc.trade.swap;
                                            Texter.write(msg, player.socketId);
                                            return;
                                         });
                                     } else {
                                        var msg= 'The '+reciever+' says:\'Thank you!\' and turns away.';
                                        Texter.write(msg, player.socketId);
                                     }
                                // the item doesn't match the item npc wants    
                                }else{
                                    npc.setListeners();
                                    npc.emit('reject', player);
                                }
                            });                             
                         }
                    }); 
               // there's no npc in the room     
               }else{
                    var msg= 'There\'s no '+reciever+' around to give a'+what+' to.';
                    Texter.write(msg, player.socketId);
               }
           });
        // item is not in inventory
       }else{
            var msg= 'You don\'t have a '+what+' to give away.';
            Texter.write(msg, player.socketId);
       }    
    });
    console.log('give '+what+' to '+reciever);  
};
