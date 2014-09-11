/* 
 * This file is responsible to handle the messages outputted by type-writer-effect
credits for eventListener-setup goes to
http://armen138.com/post/19717255050/implementing-custom-events-in-javascript
 */

var TextStream = function(){
    var self = this;
    var eventList = {};
    self.stream = [];
    self.ready = true;

    self.addEventListener = function(eventName, callback) {
        if(!eventList[eventName]) {
            eventList[eventName] = [];
        }
        eventList[eventName].push(callback);
    };
 
    self.removeEventListener = function(eventName, callback) {
        var index = -1;
        if(eventList[eventName]) {
            index = eventList[eventName].indexOf(callback);
            if(index != -1) {
                eventList[eventName].splice(index, 1);
            }
        }
    };
 
    self.triggerEvent = function(eventName, eventObject) {
        if(eventList[eventName]) {
            for( var i = 0; i < eventList[eventName].length; i++) {
                eventList[eventName][i](eventObject);
            }	
        }
    };
    
    // emitter for ready-with-typing-event
    self.readyAgain = function(){
      self.triggerEvent('ready');  
    };
    
    // listener for ready-with-typing-event
    self.isReady = function(callback){
        self.addEventListener('ready', callback);
    }; 
    
    // add message to array and try to output it
    self.add = function(message){
        self.stream.push(message);
        self.write();
    };
    
    // remove message from array
    self.remove = function(index){
        self.stream.splice(index,1);
    };
           
    // write the first message of array - if we are ready for it
    self.write = function(){
        if(self.ready){
            typeOnScreen(self.stream[0],0); 
            self.ready = false;
        }            
    };
};

var textStream = new TextStream();

textStream.isReady(function(){
   textStream.ready = true; 
});

