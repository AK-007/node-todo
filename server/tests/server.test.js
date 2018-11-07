const request = require('supertest');
const expect = require('expect');
const {app} = require('../server');
const {Todo} = require('../models/todo');
const {ObjectId} = require('mongodb');

const todos = [{
    _id : new ObjectId(),
    text : "Initial1"
}, {
    _id : new ObjectId(),
    text : "Initial2",
    completed: true,
    completedAt : 333
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a todo', (done) => {
        const t = "fghj";
        request(app)
            .post('/todos')
            .send({text:t})
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(t);
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                Todo.find({text:t}).then((tr) => {
                    expect(tr.length).toBe(1);
                    expect(tr[0].text).toBe(t);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () =>{
    it('should get all todos',(done) =>{
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc',(done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectId().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 if non-object Ids', (done) => {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id' ,() => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) =>{
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBe(null);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 404 if todo not found',(done) => {
        var hexId = new ObjectId().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);

    });
    it('should return 404 if object is invalid',(done) => {
        request(app)
            .delete('/todos/123ab')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id',() => {
    it('should update a todo',(done) => {
        var hexId = todos[0]._id.toHexString();
        var text = 'This is patch1';
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed:true,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(true);
                expect(typeof res.body.todo.completedAt).toBe('number');
                expect(res.body.todo.text).toBe(text);
            })
            .end(done);
    });
    it('should clear completedAt when todo is not completed',(done) => {
        var hexId = todos[1]._id.toHexString();
        var text = 'This is patch2';
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                completed: false,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completedAt).toBe(null);
                expect(res.body.todo.completed).toBe(false);
            })
            .end(done);
    });
});
