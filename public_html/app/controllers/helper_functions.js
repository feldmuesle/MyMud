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