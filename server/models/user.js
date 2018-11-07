const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const _=require('lodash');
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true,'User email is required'],
        trim: true,
        minlength: 1,
        unique: true,
        validate : {
            validator : (v) => {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message : '{VALUE} is note a valid email'
        }
    },
    password : {
        type: String,
        minlength: 5,
        require: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type:String,
            required: true
        }
    }]
});
UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject,['_id','email']);
};
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(),access},'123abc').toString();
    user.tokens.push({access,token});
    return user.save().then(() => {
        return token;
    });
};
var User = mongoose.model('User', UserSchema);

module.exports = {User};
