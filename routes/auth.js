const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/login', (req, res) => {
	res.render('login');
})

router.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
    failureFlash: 'Invalid Id or password. Try again!!'
}), (req, res) => {
	req.user = req.user
	let role = req.user.role

	if(role == 1) { //admin
		res.redirect('/admin/dashboard')
	}else if(role == 2) { //teachers
 		res.redirect('/teacher/dashboard')
	}else if(role == 3) { // students
		res.redirect('/student/dashboard')
	}
})


router.get('/admin/dashboard', (req, res) => {
	res.send('<h1>Admin</h1>')
})

router.get('/teacher/dashboard', (req, res) => {

})

router.get('/student/dashboard', (req, res) => {

})

module.exports = router