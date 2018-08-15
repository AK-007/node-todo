const {MongoClient, ObjectId} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/',{ useNewUrlParser: true },(err, client) => {
        if(err){
            return console.log('Unable to connect to Database');
        }
        console.log('Success');
        var db = client.db('TodoApp');
        // db.collection('Todos').find({completed:false}).toArray().then((docs) =>{
        //     console.log('Todos : ');
        //     console.log(JSON.stringify(docs,undefined,2));
        // },(err) => {
        //     console.log('error');
        // });
        db.collection('Todos').find().count().then((count) =>{
            console.log(count);
        },(err) => {
            console.log('error');
        });
        client.close();
});
