/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



exports.getRandomIndex = function(array){
  
    var rand = Math.floor(Math.random()* array.length);
    return array[rand];
};


// check if the defender exists in room
exports.getIndexByKeyValue = function(array, key, value){
    
    for (var i = 0; i< array.length; i++){
        if (array[i][key] == value){
            return i;
        }        
    }
    return null;
};


// replace %s with object-properties
exports.replaceStringNpc = function(string, npc, player){
    
    string = string.replace('%npc', npc.keyword).replace('%pl', player.nickname);
    string = string.replace('%ng', getPronoun(npc.gender)).replace('%pg', getPronoun(player.gender));
    
    return string;
};

// order a list of keywords grammatically correct
exports.grammatize = function(oArray){
    var length = oArray.length;
    var string = '';
    
    switch(true){
        case(length == 2):{
                string = 'a '+oArray[0].keyword+' and a '+oArray[1].keyword;
                break;  
            }
        case(length >2):{
                for(var i=0; i<length; i++){
                   if(i == length-1){
                       string = string +' and a'+oArray[i].keyword;
                   }else {
                       string = string +'a '+ oArray[i].keyword +', ';
                   } 
                }
            }
        case(length == 1):{
                string = 'a '+oArray[0].keyword;
                break;
        }
    }
    return string;
};

exports.calcDamage = function(attPoints){
    
    var damage = 0;
    console.log('att-points: '+attPoints);
    // define impact
        switch(true){
            case (attPoints <= 5):
                impact = 'gimpy';
                damage = 1;
                break;
            
            case (attPoints >5 && attPoints < 10):
                impact = 'half-hearted';
                damage = 2;
                break;
            
            case (attPoints >10 && attPoints < 15):
                impact = 'properly';
                damage = 3;
                break;
            
            case (attPoints >15):
                impact = 'viciously';
                damage = 4;
                break;
        }
        
        return damage;
};

function getPronoun(gender){
    if(gender == 'male'){
        return 'his';
    }
    return 'her';
}