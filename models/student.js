const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let studentScheme = new mongoose.Schema({
    username : String,
    age : Number,
    class : String,
    studentId : Number,
    gender : String,
    email : String,
    courseName : String,
    password : {
        type : String,
        select : false
    },
    teacherName : [{type : String, ref : 'employee'}]
});

studentScheme.plugin(passportLocalMongoose, {usernameField : 'username'});
module.exports = mongoose.model('student', studentScheme);

