const {MongoClient, ObjectId} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/',{ useNewUrlParser: true },(err, client) => {
        if(err){
            return console.log('Unable to connect to Database');
        }
        console.log('Success');
        var db = client.db('TodoApp');
        //deletemany
        // db.collection('Todos').deleteMany({text : 'lunch'}).then((result) => {
        //     console.log('Deleted');
        // });
        //deleteOne
        // db.collection('Todos').deleteOne({text : 'lunch'}).then((result) => {
        //     console.log(result);
        // });
        //findOneAndDelete
        // db.collection('Todos').findOneAndDelete({completed : true}).then((result) =>{
        //     console.log(result);
        // });

});
