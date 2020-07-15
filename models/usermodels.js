const mongoose = require('mongoose');

let userScheme = new mongoose.Schema({
    name : String,
    email : String,
    password : {
        type : String,
        select : false
    } 
})

module.exports = mongoose.model('user', userScheme);