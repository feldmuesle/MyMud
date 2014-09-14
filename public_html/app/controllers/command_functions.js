/* 
 * Functions used to handle commands
 */


//attack
exports.attack = function (attacker, defender){
        
    var index = getIndexByKeyValue(playersInRoom, 'nickname', defender);

    //check if there's anybody to attack in the room
    if(index != null){
        defender = playersInRoom[index];            
        battle(attacker, defender);

        appendToChat('info','You attack '+defender.nickname);
    } else {
        appendToChat('meta','Nobody called '+defender+' you could attack is in this room.');
    }                
};    
    
    // battle 
exports.battle = function(attacker, defender){
        
        console.log(attacker);
        console.log(defender);
        
        var msg = attacker.nickname +' attacks '+defender.nickname;
        var attackPoints = Math.floor(Math.random()* attacker.attributes.hp +1);
        var defensePoints = Math.floor(Math.random()* defender.attributes.hp +1);
        var hitHowIndex = Math.floor(Math.random()* hitHow.length);
        var hitWhereIndex = Math.floor(Math.random()* hitWhere.length);
        var defMsg ="";
        var attMsg ="";
        var impact = "";
        var damage = 0;
        var stats = "";
        var outcome = "";
        
        // define impact
        switch(true){
            case (attackPoints <5):
                impact = 'gimpy';
                damage = 1;
                break;
            
            case (attackPoints >5 && attackPoints < 10):
                impact = 'half-hearted';
                damage = 2;
                break;
            
            case (attackPoints >10 && attackPoints < 15):
                impact = 'properly';
                damage = 3;
                break;
            
            case (attackPoints >15 && attackPoints < 20):
                impact = 'viciously';
                damage = 4;
                break;
        }
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