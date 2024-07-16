const express = require("express");
const router = express.Router();
const passport = require("passport");
const passportConfig = require("../passport");
const JWT = require("jsonwebtoken");
const Users = require("../models/users.model");

router.get("/:customerId", async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const existingUser = await Users.findOne({ _id: customerId });
    if (existingUser) {
      return res.status(200).json({ wishlist: existingUser.wishlist });
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch wishlist.", error: err.message });
  }
});



//===========================================
router.post("/wishing/:userid", async (req, res) => {
  const { product_id, categories_id, brands_id } = req.body;
  const customerId = req.params.userid;
  try {
    const existingUser = await Users.findOne({ _id: customerId });
    if (existingUser) {
      const existingItemIndex = existingUser.wishlist.findIndex(
        (item) => item.product_id.toString() === product_id
      );

      if (existingItemIndex !== -1) {
        existingUser.wishlist.splice(existingItemIndex, 1);

        await existingUser.save();

        return res
          .status(200)
          .json({ message: "Item removed from wishlist successfully." });
      } else {
        existingUser.wishlist.push({
          product_id,
          categories_id,
          brands_id,

        });

        await existingUser.save();

        return res
          .status(201)
          .json({ message: "Item added to wishlist successfully." });
      }
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to add item to wishlist.", error: err.message });
  }
});


//===========================================

// Delete item from wishlist
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Wishlist.findByIdAndDelete(req.params.id);
    if (deletedItem) {
      res.json({ message: "Item deleted" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
