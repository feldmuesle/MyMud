/* 
connect to MongoDB
 */

var credentials = {
"hostname":"localhost",
"port":27017,
"username":"",
"password":"",
"name":"",
"db":"mud"
};

function generate_mongo_url(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'mud');
    
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
};
var mongourl = generate_mongo_url(credentials);

module.exports = {
    'url': mongourl
};
