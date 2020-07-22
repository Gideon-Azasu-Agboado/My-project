const express = require('express');
const router = express.Router();
const passport = require('passport');

const Employee = require('../models/employ');
const Student = require('../models/student');
const User = require('../models/user');


router.get("/employees/create", (req, res) => {
    res.render("Add")
});

router.get('/employees', (req, res) => {
  Employee.find({}).populate('user')
    .then(employees => {
        res.render('database', { employees: employees });
    })
    .catch(err => {
        req.flash('error_msg', 'ERROR :' + err)
        // res.redirect('/');
    })
})

router.get('/employees/:id', (req, res) => {
  Employee.findOne( {_id: req.params.id }).populate('user')
    .then(employee => {
        res.render('edit', { employee: employee });
    })
    .catch(err => {
        req.flash('error_msg', 'ERROR :' + err)
        res.redirect('/admin/employees');
    });
})

router.post('/employees', (req, res) => {

  //do backend validation here

    let newUser = {
      username: req.body.username,
      email : req.body.email,
      role: 2
    }

    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err)
            req.flash('error_msg', 'ERROR :' + err)
            res.redirect('/admin/employees/create');
        }

        if(user) {
          let { designation, salary, courseName } = req.body

          Employee.create({
            designation,
            salary,
            courseName,
            class: req.body.class,
            user: user.id

          }, (err, employee) => {
              if(err) {
                console.log(err)
                req.flash('error_msg', 'ERROR :' + err)
                res.redirect('/admin/employees/create');
              }

              if(employee) {
                req.flash('success_msg', 'Employee created')
                res.redirect('/admin/employees')
              }
          })
        }
    })
    
})


router.put('/employees/:id', (req, res) => {

    // do backend validation here

    let id = {_id: req.params.id}

    Employee.updateOne(id, {
        $set: {
            designation: req.body.designation,
            salary: req.body.salary,
        }
    }).then(result => {
        
        let employee = Employee.findOne(id).populate('user').then(employee => {
          User.updateOne({_id: employee.user.id}, {username: req.body.username}, (err, user) => {
            if(err) {
              req.flash('error_msg', 'ERROR :' + err)
              res.redirect('/employees/'+req.params.id);
            }

            req.flash('success_msg', 'Employee updated')
            res.redirect('/admin/employees');
          })
        })
        
       
    }).catch(err => {
      console.log(err)
        req.flash('error_msg', 'ERROR :' + err)
        res.redirect('/admin/employees/'+req.params.id);
    })
});


router.delete('/employees/:id', (req, res) => {

  Employee.findOne({_id: req.params.id})
    .populate('user')
    .then(employee => {

      
      deleteEmp(employee.id, employee.user.id)

      req.flash('success_msg', 'employee deleted')
      res.redirect('/admin/employees');

    }).catch(err => {

        req.flash('error_msg', 'ERROR :' + err)
        res.redirect('/admin/employees');
    })

})


/**
  Delete employee
*/

async function deleteEmp(employeeId, userId) {
  await Employee.deleteOne({_id: employeeId})
  await User.deleteOne({_id:  userId})
}




module.exports = router;