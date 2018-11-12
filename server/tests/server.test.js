const request = require('supertest');
const expect = require('expect');
const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const useroneid = new ObjectID();
const usertwoid = new ObjectID();
const users = [{
    _id : useroneid,
    email : "and@gmail.com",
    password: 'userPass',
    tokens:[{
        access: 'auth',
        token: jwt.sign({ _id: useroneid,access:'auth'},process.env.JWT_SECRET).toString()
    }]
}, {
    _id : usertwoid,
    email : "and2@gmail.com",
    password: 'userPass',
    tokens:[{
        access: 'auth',
        token: jwt.sign({ _id: usertwoid,access:'auth'},process.env.JWT_SECRET).toString()
    }]
}];
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: useroneid
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: usertwoid
}];
beforeEach((done) => {
    User.remove({}).then(() => {
        var user1 = new User(users[0]).save();
        var user2 = new User(users[1]).save();
        return Promise.all([user1,user2]);
    }).then(() => done());
});
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => {
        done();
    });
});

describe('POST /todos', () => {
    it('should create a todo', (done) => {
        const t = "fghj";
        request(app)
            .post('/todos')
            .set('x-auth',users[0].tokens[0].token)
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
            .set('x-auth',users[0].tokens[0].token)
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
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc',(done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });
    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('should return 404 if non-object Ids', (done) => {
        request(app)
            .get(`/todos/123`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('should return not todo doc created by other',(done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id' ,() => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth',users[1].tokens[0].token)
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
    it('should not remove a todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth',users[1].tokens[0].token)
            .expect(404)
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeTruthy();
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 404 if todo not found',(done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth',users[1].tokens[0].token)
            .expect(404)
            .end(done);

    });
    it('should return 404 if object is invalid',(done) => {
        request(app)
            .delete('/todos/123ab')
            .set('x-auth',users[1].tokens[0].token)
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
            .set('x-auth',users[0].tokens[0].token)
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
    it('should not update a todo created by other',(done) => {
        var hexId = todos[0]._id.toHexString();
        var text = 'This is patch1';
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth',users[1].tokens[0].token)
            .send({
                completed:true,
                text
            })
            .expect(404)
            .end(done);
    });
    it('should clear completedAt when todo is not completed',(done) => {
        var hexId = todos[1]._id.toHexString();
        var text = 'This is patch2';
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth',users[1].tokens[0].token)
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

describe('GET /users/me', () => {
    it('should return user if authenticated',(done) => {
        request(app)
            .get('/users/me')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated',(done) => {
        request(app)
            .get('/users/me')
            .set('x-auth','as')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
      }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!'
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login',() => {
    it('should login user and return auth token',(done) => {
        request(app)
            .post('/users/login')
            .send({email:users[1].email,password:users[1].password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                User.findById(users[1]._id).then((user) =>{
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch(e => done(e));
            });
    });
    it('should reject invalid login',(done) => {
        request(app)
            .post('/users/login')
            .send({email:users[1].email,password:'sds'})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).not.toBeTruthy();
            })
            .end((err,res) => {
                if(err){
                    return done(err);
                }
                User.findById(users[1]._id).then((user) =>{
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch(e => done(e));
            });
    });
});
describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });
});
