/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/************ Chat *********************/

var users = []; //array of users that are currently connected
var numUsers =0;

// get all the models we need
var Guild = require('../models/guilds.js');
var PlayerModel = require('../models/player.js');
var User = require('../models/user.js');


module.exports.response = function(socket){
    console.log('hello from socket-response');
    
    // if the user already has a game saved
    socket.on('loadGame', function(){
        console.log('socket: load an existing game');
    });
    
    
    // initialize new game
    socket.on('initialize player', function(data){ 
       var newPlayer;
       console.log('the players nickname: '+data['nickname']);
       
       
       //get the chosen guild and set attributes according to it
       var guildPromise = Guild.findOne({name :data['guild']},function(err, doc){    
                
            if(err){return console.error(err);}
            
            newPlayer = new PlayerModel();
            console.log(data['nickname']);
            newPlayer.nickname = data['nickname'];
            newPlayer.guild = data['guild'];
            
            // parse mongoose-docuemnt to javascript-object
            var guild = JSON.stringify(doc);
            var newGuild = JSON.parse(guild);
                    
            // set all the players properties
            newPlayer.attributes['hp'] = newGuild.hp;
            newPlayer.attributes['sp'] = newGuild.sp;
            
            // call init-function, set default-values and set-up eventlisteners;
            newPlayer.init(socket);
            newPlayer.write('Here is a written message!');
            console.log(newPlayer);
            
            // when all is good, push the player into users-array and increment
            users.push(newPlayer);
            numUsers++;
        }).exec();
        guildPromise.then(function(){
            newPlayer.save(function(err){
                if(err){console.error(err); return;}
                console.log('saving player succeeded.');
                console.log(newPlayer);
            });                        
        });
        console.log('end on initialisation');
    });
    // initialize player end
    
}; // module.exports.response end
