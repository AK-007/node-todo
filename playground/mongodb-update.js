const {MongoClient, ObjectId} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/',{ useNewUrlParser: true },(err, client) => {
        if(err){
            return console.log('Unable to connect to Database');
        }
        console.log('Success');
        var db = client.db('TodoApp');
        //findOneAndUpdate
        // db.collection('Users').findOneAndUpdate({
        //     _id : new ObjectId("5b742bd57acf3f081c01ca0c")
        // }, {
        //     $set: {
        //         age : 36
        //     }
        // }, {
        //     returnOriginal : false
        // }).then((result) => {
        //     console.log('Success');
        // });
        db.collection('Users').findOneAndUpdate({
            _id : new ObjectId("5b743c7022d044aa61a78b18")
        }, {
            $set: {
                name : 'Andrew'
            },
            $inc: {
                age : 1
            }
        }, {
            returnOriginal : false
        }).then((result) => {
            console.log('Done');
        });
});
