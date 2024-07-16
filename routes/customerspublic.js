const router = require("express").Router();
const passport = require("passport");
let Users = require("../models/users.model");

const title = "User";
const roleTitle = "customers";
const bcrypt = require("bcryptjs");
const BCRYPT_SALT_ROUNDS = 10;

router.post(
  "/updatePasswordCustomer",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const rolesControl = req.user.role;
    if (rolesControl[roleTitle + "/id"] || req.body._id == req.user._id) {
      Users.findOne({
        $and: [{ _id: req.body._id }, { isCustomer: true }],
      }).then((users) => {
        if (users != null) {
          console.log("user exists in db");
          bcrypt
            .hash(req.body.password, BCRYPT_SALT_ROUNDS)
            .then((hashedPassword) => {
              Users.findOneAndUpdate(
                {
                  _id: req.body._id,
                },
                {
                  password: hashedPassword,
                }
              )
                .then(() => {
                  res.json({
                    messagge: title + " Password Update",
                    variant: "success",
                  });
                })
                .catch((err) => {
                  console.log(err);
                  res.json({
                    messagge: "Error: " + err,
                    variant: "error",
                  });
                });
            });
        } else {
          console.error("no user exists in db to update");
          res.status(401).json("no user exists in db to update");
        }
      });
    } else {
      res.json({
        messagge: " You are not authorized, go away!",
        variant: "error",
      });
    }
  }
);

// add address
router
  .route("/address")
  .post(passport.authenticate("jwt", { session: false }), (req, res) => {
    Users.findOneAndUpdate(
      { username: req.user.username },
      { $set: { address: req.body } }
    )
      .then((data) => {
        res.json(data.address);
      })
      .catch((err) =>
        res.json({
          messagge: "Error:( " + err,
          variant: "error",
        })
      );
  });


router.route("/address_delete/:id").put(passport.authenticate("jwt", { session: false }), (req, res) => {
  const customerId = req.params.id;
  const addressId = req.body.customeraddressid;

  Users.findOne({ _id: customerId })
    .then(user => {
      if (!user) {
        return res.status(404).json({ message: "User not found", variant: "error" });
      }
      user.address = user.address.filter(address => address._id.toString() !== addressId);

      user.save()
        .then(updatedUser => {
          res.json(updatedUser);
        })
        .catch(err => {
          res.status(500).json({ message: "Error saving user: " + err, variant: "error" });
        });
    })
    .catch(err => {
      res.status(500).json({ message: "Error finding user: " + err, variant: "error" });
    });
});


module.exports = router;

