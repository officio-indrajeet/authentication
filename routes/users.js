const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const passport = require("passport");

// User Scheama
const User = require("../models/User");

// login route
router.get("/login", (req, res) => {
  res.render("login");
});

// register route
router.get("/register", (req, res) => {
  res.render("register");
});

// @type POST
// @route /users/register
// @desc route for registration of users and also checks all the validation
// @access PUBLIC

router.post("/register", (req, res) => {
  // Destructing the request body
  const { name, email, password, password2 } = req.body;
  // for displaying error messages
  let errors = [];

  // check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  // check password match
  if (password != password2) {
    errors.push({ msg: "Password do not match" });
  }

  // check password length
  if (password.length < 6) {
    errors.push({ msg: "Password should be atleast 6 characters" });
  }

  // if there is any error , then we want to render the registration page
  // and we don't want to erase the older values
  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // Validation passed
    // checking if user already existing in db
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        // creating new user
        const newUser = new User({
          name,
          email,
          password,
        });

        // encrypting the password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // set password to hashed
            newUser.password = hash;
            // save user
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Login handle

// @type POST
// @route /users/login
// @desc route for /users/login and uses Local Strategy
// @access PUBLIC

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout Handle

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

module.exports = router;
