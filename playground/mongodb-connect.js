//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectId} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/',{ useNewUrlParser: true },(err, client) => {
        if(err){
            return console.log('Unable to connect to Database');
        }
        console.log('Success');
        var db = client.db('TodoApp');
        db.collection('Todos').insertOne({
            text : 'Something',
            completed : true
        },(err,result) => {
            if(err){
                return console.log('Error',err);
            }
            console.log(JSON.stringify(result.ops,undefined,2));
        });
        db.collection('Users').insertOne({
            name : 'Ayush',
            age : 23,
            location : 'Delhi'
        },(err,result) => {
            if(err){
                return console.log('Error',err);
            }
            console.log(JSON.stringify(result.ops,undefined,2));
        });
        client.close();
});
