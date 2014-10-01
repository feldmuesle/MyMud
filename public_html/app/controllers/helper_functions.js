/* 
 * This file contains helper-functions for calculations or checking values
 */

/********* validation-helpers **********************/

// check if value is empty
exports.valEmpty = function(val){
    if(val){
        return val.length > 0;
    }else {
        return false;
    }
    
};

// check if array is empty
exports.arrayEmpty = function(array){
    // is 0 if one record exist
    return array.length >= 0;
};


// strip all 'mal-chars' and replace with ''
exports.sanitizeString = function(string){
    console.log('string to sanitize '+string);
    if(typeof stringValue && string){
        console.log('string sanitized '+string);
        return string.replace(/[&<>${}\[\]/]/g,'');
    }    
};

// strip everything thats not a number
exports.sanitizeNumber = function (numb){
    console.log('number to sanitize: '+numb);
    return numb.replace(/[^0-9]/g, '');
};



// get random index of array
exports.getRandomIndex = function(array){
   
    var rand = Math.floor(Math.random()* array.length);
    return array[rand];
};


// get index of assoc-array by key and value
exports.getIndexByKeyValue = function(array, key, value){
    
    for (var i = 0; i< array.length; i++){
        if (array[i][key] == value){
            return i;
        }        
    }
    return null;
}

exports.glueMsg = function(msgArray){
    var msg='';
            for(var i=0; i<msgArray.length; i++ ){
                msg += msgArray[i] + ' ';
            }
            
            // strip all special-chars we don't want
            return msg.replace(/[&<>${}\[\]/]/g,'');
};

//exports.countObjsInObject = function(object){
//    var i=0;
//    for(var key in object){
//        i++;
//    }
//    return i;
//    
//};

exports.getCheckBoxes = function(checkboxClass){
    var checkboxes = document.getElementsByName(chkboxName);
  var checkboxesChecked = [];
  // loop over them all
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked) {
        checkboxesChecked.push(checkboxes[i]);
     }
  }
  // Return the array if it is non-empty, or null
  return checkboxesChecked.length > 0 ? checkboxesChecked : null;
    
};

exports.autoIncrementId = function(mongooseArray){
    var ids=[];
    for(var i=0; i<mongooseArray.length; i++){
           ids.push(mongooseArray[i].id);
       }
    var largest = Math.max.apply(Math, ids);
    
    // if no records, start at 0 and increment
    if (largest > -1){
            return largest + 1; 
    }else {
        return 0;
    }
     
};

exports.replaceStringItem = function(string, npc, item){
    string = string.replace('%it', item.keyword).replace('%npc', npc.keyword)
                .replace('%ng', getPronoun(npc.gender));
    return string;
};

// replace %s with object-properties
exports.replaceStringPlayer = function(string, npc, player){
    
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
    var desc = '';
    console.log('att-points: '+attPoints);
    // define impact
        switch(true){
            case (attPoints <= 5):
                desc = 'just a little scratch';
                damage = 10;
                break;
            
            case (attPoints >5 && attPoints <=7):
                desc = 'a bloody nose';
                damage = 20;
                break;
            
            case (attPoints >10 && attPoints <= 12):
                desc = 'some broken ribs';
                damage = 35;
                break;
            
            case (attPoints >12):
                desc = 'seriously beaten up and needs medical attention';
                damage = 50;
                break;
        }
        
        return {'points':damage,'desc':desc};
};

function getPronoun(gender){
    if(gender == 'male'){
        return 'his';
    }
    return 'her';
}

exports.getPronoun = getPronoun;

exports.highlight = function(word, string, callback) {
        var rgxp = new RegExp(word, 'gi');
        var repl = '*' + word + '*';
        string = string.replace(rgxp, repl);    
        callback(string);
    };