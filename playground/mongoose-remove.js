const {mongoose} =require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {ObjectId} = require('mongodb');
const {User} = require('../server/models/user');

// Todo.remove({}).then((res) => {
//     console.log(res);
// });

Todo.findOneAndRemove({_id : '5b9eb7267dcaa40f0d8956db'}).then((todo) => {

});

// Todo.findByIdAndRemove('5b9eb7267dcaa40f0d8956db').then((res) => {
//     console.log(res);
// });
