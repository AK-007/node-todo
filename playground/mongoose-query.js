const {mongoose} =require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {ObjectId} = require('mongodb');
var id = '5b85a0e502417437c49739dc1';

if(!ObjectId.isValid(id)){
    console.log('ID not Valid');
}
Todo.find({
    _id: id
}).then((todos) => {
    console.log('Todos',todos);
});

Todo.findOne({
    _id: id
}).then((todo) => {
    console.log('Todo',todo);
});

Todo.findById(id).then((todo) => {
    if(!todo){
        return console.log('No todo with this id');
    }
    console.log('Todo',todo);
}).catch((e) => console.log(e));
