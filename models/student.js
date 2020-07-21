const mongoose = require('mongoose');

let studentScheme = new mongoose.Schema({
    age : Number,
    class : String,
    studentId : Number,
    gender : String,
    courseName : String,
    teacherName : [{type : String, ref : 'employee'}],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Student', studentScheme);

