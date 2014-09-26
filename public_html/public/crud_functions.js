/* 
 * functions to handle all crud
 */

$(document).ready(function(){
    
    // hide alert-window for now
    $('#alertNpc').hide();
    $('#alertRoom').hide();
    
    //create item
    $('#btnCreateItem').click(function(){
       var form = $('#createItem input[name=form]').val();
       console.log(form);
       var name = $('#createItem input[name=keyword]').val();
       var shortDesc = $('#createItem input[name=shortDesc]').val();
       var description = $('#createItem input[name=description]').val();
       var maxLoad = $('#createItem input[name=maxLoad]').val();
       var behaviours = [];
       
       $('#createItem input[name=behaviours]:checked').each(function(){
          behaviours.push($(this).val()); 
       });
       
       var item = {
           'form'       :   form,
           'keyword'    :   name,
           'shortDesc'  :   shortDesc,
           'description':   description,
           'maxLoad'    :   maxLoad,
           'behaviours' :   behaviours
       };
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',item);
       
       // clear all inputs in form
       $('#createItem').trigger('reset');
       clearCheckboxes($('#createItem'));
       console.dir(item);
    });
    
    // count the dynamic added fields for e.g. adding chatting-messages to npc
    var countFields = 1;
    
    //create npc
    $('#btnCreateNpc').click(function(){
        
       //empty validation-alert
        $('#alertNpc').text(''); 
       
        var npcId = $('#npcId').val();
        var form = $('#createNpc input[name=form]').val();
        var name = $('#createNpc input[name=keyword]').val();
        var gender = $('#createNpc input[name=gender]:radio:checked').val();
        var shortDesc = $('#createNpc input[name=shortDesc]').val();
        var description = $('#createNpc input[name=description]').val();
        var maxLoad = $('#createNpc input[name=maxLoad]').val();
        var pacifist = $('#createNpc input[name=pacifist]:radio:checked').val();
        var hp = $('#createNpc input[name=hp]').val();
        var sp = $('#createNpc input[name=sp]').val();
        var health = $('#createNpc input[name=health]').val();
        var playerEnters = $('#createNpc input[name=playerEnters]').val();
        var playerDrops = $('#createNpc input[name=playerDrops]').val();
        var playerChat = [];
        var behaviours = [];
        var items = [];
        console.log('npcId before sending: '+npcId);
        for(var i=countFields; i>0; i--){
            var msg = $('#createNpc input[name=chat'+i+']').val();
            playerChat.push(msg);
            console.log(msg);
            console.log('i in loop '+i);
        }
       
       $('#createNpc input[name=behaviours]:checked').each(function(){
           console.log($(this).val());
          behaviours.push($(this).val()); 
       });
       
       $('#createNpc input[name=items]:checked').each(function(){
           console.log($(this).val());
            items.push($(this).val()); 
       });
       
       
       if(form == 'updateNpc'){
            var npc = {
                        'id'        :   npcId,
                        'form'      :   form,
                        'keyword'   :   name,
                        'gender'    :   gender,
                        'shortDesc' :   shortDesc,
                        'description':   description,
                        'maxLoad'   :    maxLoad,
                        'pacifist'  :   pacifist,
                        'hp'        :   hp,
                        'sp'        :   sp,
                        'health'    :   health,
                        'playerEnters':  playerEnters,
                        'playerDrops':   playerDrops,
                        'playerChat':   playerChat,
                        'behaviours':   behaviours,
                        'items'      :   items
                    };
            
            // reset modal-button again
            $('#createNpc input[name=form]').val('createNpc');
            
       }else {
            var npc = {
           'form'       :   form,
           'keyword'    :   name,
           'gender'     :   gender,
           'shortDesc'  :   shortDesc,
           'description':   description,
           'maxLoad'   :    maxLoad,
           'pacifist'   :   pacifist,
           'hp'         :   hp,
           'sp'         :   sp,
           'health'     :   health,
           'playerEnters':  playerEnters,
           'playerDrops':   playerDrops,
           'playerChat' :   playerChat,
           'behaviours' :   behaviours,
           'items'      :   items
       };
       }
       
       
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',npc, function(data){
           console.log('hello back from server');
           if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertNpc').show();
                $('#alertNpc').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                     console.log('error-message twice: '+err['message']);

                    $('#alertNpc').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // hide modal 
                $('#createNpcs').modal('hide');
                
                // set submit-button to default again
                $('#btnCreateNpc').text('create');
                console.log(data['msg']);
                npcs = data['npcs'];
                console.log(npcs);
                // clear all inputs in form
                $('#createNpc').trigger('reset');
                clearCheckboxes($('#createNpc'));
                removePlayerChat(playerChat.length);
                
            }
       });
       
       
    });
    
    // count the dynamic added fields for e.g. adding chatting-messages to npc
    var countExits=1;
    console.log('countExits when script loaded'+countExits);
    
    //create room
    $('#btnCreateRoom').click(function(){
        
        //empty validation-alert
        $('#alertRoom').text('');
        
       var form = $('#createRoom input[name=form]').val();
       console.log(form);
       var name = $('#createRoom input[name=keyword]').val();
       var description = $('#createRoom input[name=description]').val();
       var roomId = $('#roomId').val();
       var formNpcs = [];
       var formItems = [];
       var exits = [];
       
       
       $('#createRoom input[name=npcs]:checked').each(function(){
            formNpcs.push($(this).val()); 
       });
       
       $('#createRoom input[name=items]:checked').each(function(){
            formItems.push($(this).val()); 
       });
       
       console.log('countExits inside createRoom: '+countExits);
       for(var i=countExits; i>0; i--){
           
           var exit = {
               'keyword'    : $('#createRoom input[name=exitKey'+i+']').val(),
               'description': $('#createRoom input[name=exitDesc'+i+']').val(),
               'exitId'     : $('#createRoom select[name=exitId'+i+']').val(),
               'action'     : $('#createRoom input[name=action'+i+']').val(),
               'goodbye'    : $('#createRoom input[name=goodbye'+i+']').val(),
               'hello'      : $('#createRoom input[name=hello'+i+']').val()
           };
           exits.push(exit);
           console.log(exit);
           console.log('i in loop '+i);
       }
       
       if(form == 'updateRoom'){
            var room = {
                'form'       :   form,
                'id'         :   roomId,
                'keyword'    :   name,
                'description':   description,
                'npcs'       :   formNpcs,
                'items'      :   formItems,
                'exits'      :   exits
            };
            
            // reset modal-button again
            $('#createRoom input[name=form]').val('createRoom');
            
       }else {
            var room = {
                'form'       :   form,
                'keyword'    :   name,
                'description':   description,
                'npcs'       :   formNpcs,
                'items'      :   formItems,
                'exits'      :   exits
            };
       }
       
       
       // send data to server and get response back
       $.post('/crud',room, function(data){
           
            if(!data['success']){
                var errors = data['errors'];
                console.log(typeof errors);
                $('#alertRoom').show();
                $('#alertRoom').append('<h3>'+data['msg']+'</h3>');
                for(var key in errors){
                    var err = errors[key];
                    console.log('error-message: '+err.message);
                     console.log('error-message twice: '+err['message']);

                    $('#alertRoom').append('<p>'+err.message+'</p>');
                };
            }else{
                
                // hide modal 
                $('#createRooms').modal('hide');
                
                // set submit-button to default again
                $('#btnCreateRoom').text('create');
                console.log(data['msg']);
                // update locations
                locations = data['locations'];
                console.log(locations);
                // clear all inputs in form
                $('#createRoom').trigger('reset');
                clearCheckboxes($('#createRoom'));
                removeExitFields(exits.length);
            }
           
           
       });
       
       
       console.dir(room);
    });
    
    // button for showing modal form for updating npc
    $('.updateNpc').click(function(){
        $('#createNpc').trigger('reset');
        console.log('want to update npc?');
        var npcId = this.id.charAt(this.id.length-1);
        var npc = getRecordById(npcs, npcId);
        console.log(npc.gender);
        
        // populate npc in modal form
        $('#createNpc input[name=form]').val('updateNpc');
        $('#createNpc input[name=keyword]').val(npc.keyword);
        $('#createNpc input[name=gender]:checkbox[value ='+npc.gender+']').attr('checked',true);
        $('#createNpc input[name=shortDesc]').val(npc.shortDesc);
        $('#createNpc input[name=description]').val(npc.description);
        $('#createNpc input[name=maxLoad]').val(npc.maxLoad);
        $('#createNpc input[name=pacifist]').attr('value',npc.pacifist.toString()).attr('checked', true);
        $('#createNpc input[id=hp]').val(npc.attributes['hp']);
        $('#createNpc input[id=sp]').val(npc.attributes['sp']);
        $('#createNpc input[id=health]').val(npc.attributes['health']);
        $('#createNpc input[name=playerEnters]').val(npc.actions['playerEnters']);
        $('#createNpc input[name=playerDrops]').val(npc.actions['playerDrops']);

        // add chat-messages and mayby chat-inputs
        for(var i=0; i<npc.actions['playerChat'].length; i++){
            if(i != 0){
                $('#addMore').click();
            }
            $('#createNpc input[name=chat'+(i+1)+']').val(npc.actions['playerChat'][i]);
        }

        // set checkboxes for the items
        for(var i=0; i<npc.inventory.length; i++){
            $('#createNpc input[name=items]:checkbox[value = '+npc.inventory[i].id+']').attr('checked', true);
        }
        console.log(npc);
        //set checkboxes for behaviours
        for(var i=0; i<npc.behaviours.length; i++){
            console.log('behaviour: '+npc.behaviours[i]);
            $('#createNpc input[name=behaviours]:checkbox[value ='+npc.behaviours[i]+']').attr('checked', true);
        }
        console.log('npcId: '+npcId);
        $('#npcId').val(npcId);
        $('#btnCreateNpc').text('Update');
        $("#createNpcs").modal('show');
    });


    //button for showing modal form for updation item
    $('.updateItem').click(function(){
        console.log('want to update item?');
        var itemId = this.id.charAt(this.id.length-1);
        var item = getRecordById(items, itemId);
        console.log('itemId to update: '+itemId);

        // populate item in modal form
        $('#createItem input[name=form]').val('updateItem');
        $('#createItem input[name=keyword]').val(item.keyword);
        $('#createItem input[name=shortDesc]').val(item.shortDesc);
        $('#createItem input[name=description]').val(item.description);
        $('#createItem input[name=maxLoad]').val(item.maxLoad);

        console.log(item);
        // set checkboxes for behaviours
        for(var i=0; i<item.behaviours.length; i++){
            $('#createItem input[name=behaviours]').attr('value',item.behaviours[i]).attr('checked', true);
        }
        $('#btnCreateItem').text('Update');
        $("#createItems").modal('show');
    });

    
    // button for showing modal form for updating room
    $('.updateRoom').click(function(){
        console.log('want to update room?');
        var roomId = this.id.charAt(this.id.length-1);
        console.log('want to update room '+roomId);
        var room = getRecordById(locations, roomId);

        // populate room in modal-form
        $('#createRoom input[name=form]').val('updateRoom');
        $('#createRoom input[name=keyword]').val(room.name);
        $('#createRoom input[name=description]').val(room.description);

        for(var i=0; i< room.exits.length; i++){
            var j = i+1;
            // add new exit if there are more than one
            if(i != 0){
                $('#addExit').click();            
            }else{
                countExits = 1;
            }         
            console.log('countExits inside updateRoom'+countExits);
            $('#createRoom input[name=exitKey'+j+']').val(room.exits[i].keyword);
            $('#createRoom input[name=exitDesc'+j+']').val(room.exits[i].description);
            $('#createRoom select[name=exitId'+j+']').val(room.exits[i].exitId).attr('selected','selected');
            $('#createRoom input[name=action'+j+']').val(room.exits[i].action);
            $('#createRoom input[name=goodbye'+j+']').val(room.exits[i].goodbye);
            $('#createRoom input[name=hello'+j+']').val(room.exits[i].hello);
        }

        // set checkboxes for the npcs
        for(var i=0; i<room.npcs.length; i++){
            console.log('npc[i]id '+room.npcs[i]['id']);
            $('#createRoom input[name=npcs]:checkbox[value='+room.npcs[i]['id']+']').attr('checked', true);
        }

        // set checkboxes for the items
        for(var i=0; i<room.inventory.length; i++){
            $('#createRoom input[name=items]:checkbox[value='+room.inventory[i]['id']+']').attr('checked', true);
        }
        
        $('#roomId').val(room.id);
        $('#btnCreateRoom').text('Update');
        $("#createRooms").modal('show');
    });


    // button for deleting room
    $('.deleteRoom').click(function(e){
        e.preventDefault();
        console.log('want to delete?');
        var roomId = this.id.charAt(this.id.length-1);
        console.log('roomId to delete: '+roomId);
        $.post('/crud', {
            'roomId'    :   roomId,
            'delete'    :   'roomDel'
        });

    });

    // button for deleting npc
    $('.deleteNpc').click(function(e){
        e.preventDefault();
        console.log('want to delete?');
        var npcId = this.id.charAt(this.id.length-1);
        console.log('npcId to delete: '+npcId);
        $.post('/crud', {
            'npcId'    :   npcId,
            'delete'    :   'npcDel'
        });

    });

    // button for deleting item
    $('.deleteItem').click(function(e){
        e.preventDefault();
        console.log('want to delete?');
        var itemId = this.id.charAt(this.id.length-1);
        console.log('itemId to delete: '+itemId);
        $.post('/crud', {
            'itemId'    :   itemId,
            'delete'   :    'itemDel'
        });

    });

    // button for adding a new input-field into form in create-npc player-chat    
    var next = 1;
    $("#addMore").click(function(e){
        e.preventDefault();
        var addto = "#field" + next;
        next = next + 1;
        var inputGroup = '<div id="field' + next + '" class="input-group dynamic">'+
                '<input class="form-control" name="chat' + next + '" type="text">'+
                '<span class="input-group-btn">'+
                '<button id="remove' + next + '" class="btn remove-me" >-</button>'+
                '</span></div>';
        $('#fields').append(inputGroup);

        $("#field" + next).attr('data-source',$(addto).attr('data-source'));
        countFields = next;  

            $('.remove-me').click(function(e){
                e.preventDefault();
                var fieldNum = this.id.charAt(this.id.length-1);
                var fieldID = "#field" + fieldNum;
                $(fieldID).remove();
            });
    });

    // button for adding a new exit-fields into form in create-room    
    var nextExit = 1;
    $("#addExit").click(function(e){
        console.log('want to add an exit?');
        e.preventDefault();
        var addto = "#exits" + nextExit;
        nextExit = nextExit + 1;

        var newExitFields = '<label>Exit '+nextExit+'</label>'+
                    '<button id="remove' + (nextExit) + '" class="btn pull-right btn-danger remove-me" >&times;</button>';
        newExitFields = newExitFields +'<div class="form-group">'+
                        '<label>Keyword</label>'+
                        '<input type="text" class="form-control" name="exitKey' + nextExit + '">'+
                        '</div>';
        newExitFields = newExitFields+ '<div class="form-group">'+
                        '<label>Description</label>'+
                        '<input type="text" class="form-control" name="exitDesc' + nextExit + '">'+
                        '</div>';

        newExitFields = newExitFields+'<div class="form-group">'+
                        '<label>Leading to room</label>'+
                        '<select class="form-control" name="exitId' + nextExit + '">';
                        for( var i=0; i<locations.length; i++){
                            newExitFields = newExitFields+'<option value="'+locations[i].id+'">'+locations[i].name+'</option>';
                        }                            

        newExitFields = newExitFields+'</select></div>'; 

        newExitFields = newExitFields+'<div class="form-group">'+
                        '<label>Action for player when leaving room</label>'+
                        '<input type="text" class="form-control" name="action' + nextExit + '">'+
                        '</div>';
        newExitFields = newExitFields+'<div class="form-group">'+
                        '<label>Message for other users in room when player leaves</label>'+
                        '<input type="text" class="form-control" name="goodbye' + nextExit + '">'+
                        '</div>';
        newExitFields = newExitFields+'<div class="form-group">'+
                        '<label>Message for other users in room when player arrives</label>'+
                        '<input type="text" class="form-control" name="hello' + nextExit + '">'+
                        '</div>';  

        var exit =  '<div id="exit'+nextExit+'" class="col-xs-11 col-xs-push-1 form-group"></div>';

        $('#exits').append(exit);
        $('#exit'+nextExit).append(newExitFields);

        //$("#field" + nextExit).attr('data-source',$(addto).attr('data-source'));
        countExits = nextExit;  
        console.log('count exits from addExits '+countExits);

            $('.remove-me').click(function(e){
                e.preventDefault();
                var fieldNum = this.id.charAt(this.id.length-1);
                var fieldID = "#exit" + fieldNum;
                $(this).remove();
                $(fieldID).remove();
            });
    });


    // make item-li-items clickable and show details in modal window
    $('.showItem').click(function(){
       console.log('you have clicked a list-item');  
       var itemId = this.id.charAt(this.id.length-1);
       var item = getRecordById(items, itemId);
       
       var html = '<ul class="list-unstyled">'+
                '<li class="description"><h5>Short description:</h5>'+item.shortDesc+'</li>'+
                '<li class="description"><h5>Description:</h5>'+item.description+'</li>'+
                '<li class="description"><h5>Max-load:</h5>'+item.maxLoad+'</li>'+
                '<li class="description"><h5>Behaviours:</h5>';

        
            for(var j=0; j<item.behaviours.length; j++){
                html +=$('#createItem input[name=behaviours]').attr('value',item.behaviours[j]).parent().text();
            }                          
        html = html +'</li></ul>'; 
        $('#displayRecord').modal('show');
        $('#displayTitle').text(item.keyword);
        $('#displayBody').text('');
        $('#displayBody').append(html); 
    });    

    // make room-li-items clickable and show details in modal window
    $('.showRoom').click(function(){
       console.log('you have clicked a list-item');  
       var roomId = this.id.charAt(this.id.length-1);
       var room = getRecordById(locations, roomId);
       var html = '<ul class="list-unstyled">'+
                '<li class="description"><h5>Description:</h5>'+room.description+'</li>';
        console.log(room.exits.length);
            for(var j=0; j<room.exits.length; j++){

                var roomName = $('#createRoom select[name=exitId1] option[value='+room.exits[j].exitId+']').text();
                console.log('roomname: '+roomName);
                console.log(room.exits[j].keyword);
                html +='<li class="description"><h5>Exit '+j+':</h5></li>'+
                     '<li class="exitDesc"><h6>Keyword:</h6>'+room.exits[j].keyword+'</li>'+
                     '<li class="exitDesc"><h6>Leading to:</h6>'+roomName+'</li>'+
                     '<li class="exitDesc"><h6>Message to player when leaving:</h6>'+room.exits[j].action+'</li>'+
                     '<li class="exitDesc"><h6>Message to other players in room, when player leaves:</h6>'+room.exits[j].goodbye+'</li>'+
                     '<li class="exitDesc"><h6>Message to other players in room, when player arrives:</h6>'+room.exits[j].hello+'</li>';              
            }                          
        html = html +'</ul>'; 
        $('#displayRecord').modal('show');
        $('#displayTitle').text(room.name);
        $('#displayBody').text('');
        $('#displayBody').append(html);  
    });

    // make npc-li-items clickable and show details in modal window
    $('.showNpc').click(function(){
       console.log('you have clicked a npc-list-item');  
       var npcId = this.id.charAt(this.id.length-1);
       var npc = getRecordById(npcs, npcId);
       
       var html = '<ul class="list-unstyled">'+
                '<li class="description"><h5>Description:</h5>'+npc.description+'</li>'+
                '<li class="description"><h5>Gender:</h5>'+npc.gender+'</li>'+
                '<li class="description"><h5>Short description:</h5>'+npc.shortDesc+'</li>'+
                '<li class="description"><h5>Max-load:</h5>'+npc.maxLoad+'</li>'+
                '<li class="description"><h5>Pacifist:</h5>'+npc.pacifist+'</li>'+
                '<li class="description"><h5>Attributes:</h5>Attributes</li>';

        for(property in npc.attributes){
            html += '<li class="exitDesc"><h6>'+property+':</h6>'+npc.attributes[property]+'</li>';
        }

        html += '<li class="description"><h5>Player drops item:</h5>'+npc.actions['playerDrops']+'</li>'+
        '<li class="description"><h5>Player enters room:</h5>'+npc.actions['playerEnters']+'</li>';

        for(var j=0; j<npc.actions['playerChat'].length; j++){
            html +='<li class="description"><h5>Chat with player '+(j+1)+':</h5>'+npc.actions['playerChat'][j]+'</li>';            
        }

        html += '<li class="description"><h5>Behaviours:</h5>';
        for(var j=0; j<npc.behaviours.length; j++){
            html +='<span>'+npc.behaviours[j]+', </span>';            
        }

        html = html +'</li></ul>'; 
        $('#displayRecord').modal('show');
        $('#displayTitle').text(npc.keyword);
        $('#displayBody').text('');   
        $('#displayBody').append(html);


    });

    // show modal windows for creation-forms
    $('#addRoom').click(function(){
       console.log('want to create new room?'); 
       $("#createRooms").modal('show'); 
    });

    $('#addNpc').click(function(){
        console.log('want to create a npc?');
       $("#createNpcs").modal('show'); 
    });

    $('#addItem').click(function(){
        console.log('want to create a npc?');
       $("#createItems").modal('show'); 
    });
    
// misc-functions for helping
    function getRecordById(recordArray, recordId){
        for(var i=0; i<recordArray.length; i++){
                if(recordArray[i].id == recordId){
                    var room = recordArray[i];
                    return room;
                }
            }
    }
    
    function clearCheckboxes(formEl){
        formEl.find(':checked').each(function() {
        $(this).removeAttr('checked');
     });
    }
    
    function removePlayerChat(chatCount){
        
        console.log('playerchats amount '+chatCount);
        // chat1 we need to keep
        for(var i=2; i<=chatCount; i++){
            console.log('remove chat'+i);
            $('#field'+i).remove();
        }
        
        // reset counters
        next = 1;
        countFields = 0;
        console.log('countFields after remove: '+countFields);
    }
    
    function removeExitFields(exitCount){
        
        console.log('exits count '+exitCount);
        // chat1 we need to keep
        for(var i=2; i<=exitCount; i++){
            console.log('remove exit'+i);
            $('#exit'+i).remove();
        }
        console.log('countExits inside removeExitsfields before reset: '+countExits);
        // reset counters
        nextExit = 1;
        countExits = 1;
        
    }
    
});
