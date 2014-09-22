/* 
 * This file holds all listeners extending npcs default-listeners
 */
var Texter = require('./texter.js');
var Helper = require('./helper_functions.js');
var Behaviours = require('./behaviours.js');

exports.listeners = {
    
    eatable : function(){
        console.log('item gets eaten');
        
    }
};