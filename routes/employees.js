const express = require('express');
const router = express.Router();
const passport = require('passport');
const async = require("async");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const Employee = require('../models/employ');
const student = require('../models/student');

//checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/employee/login');
}

router.get('/employee/Search', (req, res) => {
    res.render('search', { employee: "" });
});

router.get('/employee', (req, res) => {
    let searchQuery = { name: req.query.name };

    Employee.findOne(searchQuery)
        .then(employee => {
            res.render('search', { employee: employee });
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR :' + err)
            res.redirect('/');
        })
})

router.get('/edit/:id', (req, res) => { 
    let searchQuery = { _id: req.params.id };
    Employee.findOne(searchQuery)
        .then(employee => {
            res.render('edit', { employee: employee });
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR :' + err)
            res.redirect('/');
        });

});

router.get('/employee/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You have been logged out successfully ');
    res.redirect('/employee/login');
});

router.get("/forgot", (req,res) => {
    res.render("forgot")
});

router.get("/reset/:token", (req, res) => {
    Employee.findOne({resetPasswordToken : req.params.token, resetPasswordExpires : {$gt : Date.now()}})
    .then(employee => {
        if(!employee){
            req.flash("error_msg", "Password token is invalid or has expired.");
            res.redirect("/forgot");
        }
        res.render("newpassword", {token: res.params.token});
    })
    .catch(err => {
        req.flash("error_msg", "ERROR :" + err);
        res.redirect("/forgot");
    });
});

router.get("/password/change", (req,res) => {
    res.render("changePassword")
})

//get routes ends here

//post routes starts here
// router.post('/employee/login', passport.authenticate('local', {
//     successRedirect: '/teacher',
//     failureRedirect: '/employee/login',
//     failureFlash: 'Invalid Id or password. Try again!!'
// }));    

// router.post('/employee/Add', (req, res) => {
    
//     let newEmployee = {
//         username: req.body.username,
//         designation: req.body.designation,
//         salary: req.body.salary,
//         email : req.body.email,
//         class : req.body.class
//     };
    
//     Employee.register(newEmployee, req.body.password, (err, employee) => {
//         console.log(employee)
//         if(err) {
//             req.flash('error_msg', 'ERROR :' + err)
//             console.log(err)
//             res.redirect('/');
//         }
//         passport.authenticate('local')(req, res, () => {
//             req.flash('success_msg', 'Employee Data Added To Database Sucessfully.')
//             res.redirect('/');
//         });
//     });
// })



    //routes for forgot password
    router.post("/forgot", (req, res, next) => {
        let recoveryPassword = "";
        async.waterfall([
           (done) => {
               crypto.randomBytes(30, (err, buf) => {
                   let token = buf.toString("hex");
                   done(err, token);
               });
           },
           (token, done) => {
               Employee.findOne({email : req.body.email})
               .then(employee => {
                   if (!employee){
                       req.flash("error_msg", "User with this email does not exist.");
                       return res.redirect("/forgot");
                   }
    
                   employee.resetPasswordToken = token;
                   employee.resetPasswordExpires = Date.now() + 1800000;
    
                   employee.save(err => {
                       done(err, token, employee);
                   });
               })
               .catch(err => {
                   req.flash("error_msg", "ERROR: " + err);
                   res.redirect("/forgot");
               })
           },
           (token, employee) => {
               let smtpTransport = nodemailer.createTransport({
                   service : "GMAIL",
                   auth : {
                       user : process.env.GMAIL_EMAIL,
                       pass : process.env.GMAIL_PASSWORD
                   },
                   debug : true,
                   logger : true
               });
    
    
               let mailOptions = {
                   to : employee.email,
                   from : "Treshold Buckler treshold001@gmail.com",
                   subject : "Recovery email from Glorious Shining Star International School",
                   text : "Please click on the following link to recover your password: \n\n"+ 
                          "http://" + req.headers.host + "/reset/" + token + "\n\n" + 
                          "If you did not request this, please ignore this email."             
           };
             smtpTransport.sendMail(mailOptions, err => {
                 req.flash("success_msg", "An email with further instructions has been sent to you. Please check your email.");
                 res.redirect("/forgot");
             });
           }
        ], err => {
            if (err) res.redirect("/forgot")
        });
    });
    
    router.post("/reset/:token", (req, res) => {
        async.waterfall([
             (done) => {
               Employee.findOne({resetPasswordToken : req.params.token, resetPasswordExpires : {$gt : Date.now() }})
               .then(employee => {
                if(!employee){
                    req.flash("error_msg", "Password token is invalid or has expired.");
                    res.redirect("/forgot");
                }
                if(req.body.password !== req.body.confirmPassword ){
                    req.flash("error_msg", "Password does not match.");
                    return res.redirect("/forgot");
                }
                employee.setPassword(req.body.password, err => {
                    res.resetPasswordToken = undefined;
                    res.resetPasswordExpires = undefined;

                    employee.save(err => {
                        req.logIn(employee, err => {
                          done(err, employee);
                        })
                    });
                });
             })
             .catch(err => {
                 req.flash("error_msg", "ERROR:" + err)
                 res.redirect("/forgot");
             });
            },
            (employee) => {
                let smtpTransport = nodemailer.createTransport({
                    service : "GMAIL",
                    auth : {
                        user : process.env.GMAIL_EMAIL,
                        PASS : process.env.GMAIL_PASSWORD 
                    }
                });

                let mailOptions = {
                    to : employee.email,
                    from : "treshold001@gmail.com",
                    subject : "Your password has been changed",
                    text : "Hello" + employee.name+ "\n\n"+
                           "This is a confirmation that your password for your account " + employee.email + "has been changed"
                };

                smtpTransport.sendMail(mailOptions, err => {
                    req.flash("succes_msg", "Your password has been changed successfully.");
                    res.redirect("/employee/login");
                })
            }
        ],err => {
            res.redirect("/employee/login")
        }
        )
    })

//post routes ends here

//put routes starts here

router.put('/edit/:id', (req, res) => {
    let searchQuery = { _id: req.params.id };

    Employee.updateOne(searchQuery, {
        $set: {
            username: req.body.username,
            designation: req.body.designation,
            salary: req.body.salary,
            class : req.body.class
        }
    })
        .then(employee => {
            req.flash('success_msg', 'Employee Data Updated Sucessfully.')
            res.redirect('/');
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR :' + err)
            res.redirect('/');
        })
});

//put routes ends here

//delete routes starts here

router.delete('/delete/:id', (req, res) => {
    let searchQuery = { _id: req.params.id };

    Employee.deleteOne(searchQuery)
        .then(employee => {
            req.flash('success_msg', 'Employee Deleted Sucessfully.')
            res.redirect('/');
        })
        .catch(err => {
            req.flash('error_msg', 'ERROR :' + err)
            res.redirect('/');
        });
});

//delete routes ends here



//FOR TEACHERS
//checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/employee/login');
}

router.get('/teacher', (req, res) => {
    res.render('teacher')
}); 

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You have been successfully logged out');
    res.redirect('/employee/login');
})

router.get('/profile', (req, res) => {
    res.render('profile')
});

router.get("/password/change", (req,res) => {
    res.render("changePassword")
})

router.post("/password/change", (req, res) => {
    if(req.body.teacherPassword !== req.body.confirmTeacherPassword){
        req.flash("error_msg", "Password does not match. Try again");
        return res.redirect("/password/change");
    }
    Employee.findOne({email : req.employee.email})
    .then(employee => {
        employee.setPassword(req.body.password, err => {
            employee.save()
                .then(employee => {
                    req.flash("success_msg", "Password has been changed successfully.")
                    res.redirect("/teacher");
                })
                .catch(err => {
                    req.flash("error_msg", "ERROR: " + err);
                    res.redirect("/password/change");
                });
        });
    });
});

module.exports = router;