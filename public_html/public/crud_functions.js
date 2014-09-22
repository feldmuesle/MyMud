/* 
 * functions to handle all crud
 */

$(document).ready(function(){
    
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
       console.dir(item);
    });
    
    // count the dynamic added fields for e.g. adding chatting-messages to npc
    var countFields = 0;
    
    //create npc
    $('#btnCreateNpc').click(function(){
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
       console.log('count chat fields: '+countFields);
       for(var i=countFields; i>=0; i--){
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
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',npc);
       
       // clear all inputs in form
       $('#createNpc').trigger('reset');
       console.dir(npc);
    });
    
    //create room
    $('#btnCreateRoom').click(function(){
       var form = $('#createRoom input[name=form]').val();
       console.log(form);
       var name = $('#createRoom input[name=keyword]').val();
       var description = $('#createRoom input[name=description]').val();
       var npcs = [];
       var items = [];
       
       $('#createRoom input[name=npcs]:checked').each(function(){
            npcs.push($(this).val()); 
       });
       
       $('#createRoom input[name=items]:checked').each(function(){
            items.push($(this).val()); 
       });
       
       var room = {
           'form'       :   form,
           'keyword'    :   name,
           'description':   description,
           'npcs'       :   npcs,
           'items'      :   items
       };
       
       //$.post('/crud',JSON.stringify(item));
       $.post('/crud',room);
       
       // clear all inputs in form
       $('#createItem').trigger('reset');
       console.dir(room);
    });
    
    // button for adding a new input-field into form
    
    var next = 1;
    $(".add-more").click(function(e){
        e.preventDefault();
        var addto = "#field" + next;
        next = next + 1;
        var newInput = '<input class="dynamic form-control" id="field' + next + '" name="chat' + next + '" type="text">';
        var removeButton = '<button id="remove' + (next - 1) + '" class="dynamic btn-xs btn-danger remove-me" >-</button>';
        $('.field').append(newInput);
        $('.fieldBtn').append(removeButton);     
        $("#field" + next).attr('data-source',$(addto).attr('data-source'));
        countFields = next;  
        
            $('.remove-me').click(function(e){
                e.preventDefault();
                var fieldNum = this.id.charAt(this.id.length-1);
                var fieldID = "#field" + fieldNum;
                $(this).remove();
                $(fieldID).remove();
            });
    });
//var next = 1;
//    $(".add-more").click(function(e){
//        e.preventDefault();
//        var addto = "#field" + next;
//        var addRemove = "#field" + (next);
//        next = next + 1;
//        var newIn = '<input autocomplete="off" class="input form-control" id="field' + next + '" name="field' + next + '" type="text">';
//        var newInput = $(newIn);
//        var removeBtn = '<button id="remove' + (next - 1) + '" class="btn btn-danger remove-me" >-</button></div><div id="field">';
//        var removeButton = $(removeBtn);
//        $(addto).after(newInput);
//        $(addRemove).after(removeButton);
//        $("#field" + next).attr('data-source',$(addto).attr('data-source'));
//        $("#count").val(next);  
//        
//            $('.remove-me').click(function(e){
//                e.preventDefault();
//                var fieldNum = this.id.charAt(this.id.length-1);
//                var fieldID = "#field" + fieldNum;
//                $(this).remove();
//                $(fieldID).remove();
//            });
//    });
    
});
