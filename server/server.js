require('./config/config.js');
var express = require('express');
var bodyParser = require('body-parser');
const _ = require('lodash');
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {ObjectId} = require('mongodb');
var {authenticate} = require('./middleware/authenticate');
var app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.post('/todos', (req,res) => {
    const todo = new Todo({
        _id:new ObjectId(),
        text: req.body.text,
        completed: true
    });
    todo.save().then((todo) => {
        res.send({todo});
    }, (err) => {
        res.status(400).send(err);
    });
});
app.get('/todos',(req,res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});
app.get('/todos/:id',(req,res) => {
    var id=req.params.id;
    if(!ObjectId.isValid(id)){
        return res.status(404).send();
    }
    Todo.findById(id).then((todo) =>{
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => res.status(400).send());
});
app.delete('/todos/:id',(req,res) => {
    var id = req.params.id;
    if(!ObjectId.isValid(id)){
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => res.status(404).send());
});
app.patch('/todos/:id',(req,res) => {
    var id = req.params.id;
    var body = _.pick(req.body , ['text','completed']);
    if(!ObjectId.isValid(id)){
        return res.status(404).send();
    }
    if(_.isBoolean(body.completed) && body.completed === true){
        body.completedAt = new Date().getTime();
        body.completed = true;
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id,{$set : body},{new : true}).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => res.status(404).send());
});
app.post('/users',(req,res) => {
    var body = _.pick(req.body,['email','password']);
    var userNew = new User(body);
    userNew
        .save()
        .then((user) => {
            return user.generateAuthToken();
        })
        .then((token) => {
            res.header('x-auth',token).send(userNew);
        })
        .catch((err) => {
            console.log('Some error');
            res.status(400).send(err);
        });
});
app.get('/users/me',authenticate, (req,res) => {
    res.send(req.user);
});
app.listen(port, () => {
    console.log(`Server running on ${port}.`);
});

module.exports = {app};
