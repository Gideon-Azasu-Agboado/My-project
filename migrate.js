const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/user');


dotenv.config({path : './config.env'});
 
mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
});



let superAdmin = {
  username: "admin",
  email : "admin@mail.com",
  role: 1
}

User.register(superAdmin, "password", (err, user) => {
	if(err) {
	    console.log(err)
	}

	console.log('admin added')

	return process.exit(0);

});

