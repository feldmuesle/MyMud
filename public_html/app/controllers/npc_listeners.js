/* 
 * This file holds all listeners extending npcs default-listeners
 */
var Texter = require('./texter.js');
var Helper = require('./helper_functions.js');
var Behaviours = require('./behaviours.js');

exports.listeners = {
    
    eat : function(data){
        console.dir(data);
        var self = data['npc'];
        console.log('hello from eat-listener');
        var player = data['player'];
        var item = data['item'];
        Behaviours.eat(self, player, item);
        
    },
    cry : function(){
    
            console.log(' is crying');
            
        },
    
    dance : function(data){
        console.log('dance-date: '+data);
        console.log(' is dancing happily');
        
        }
};