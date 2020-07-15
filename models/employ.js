const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let employeeScheme = new mongoose.Schema({
    username :String ,
    designation : String,
    salary : Number,
    email : String,
    class : String,
    courseName : String,
    password : {
        type : String,
        select : false
    },
    resetPasswordToken : String,
    resetPasswordExpires : Date,
    allStudents : [{type : String, ref : 'student'}]
});

employeeScheme.plugin(passportLocalMongoose, {usernameField : 'username'});
module.exports = mongoose.model('Employee', employeeScheme);

