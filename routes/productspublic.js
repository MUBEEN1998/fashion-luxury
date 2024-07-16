const router = require("express").Router();
const mongoose = require("mongoose");
let Products = require("../models/products.model");
const Users = require("../models/users.model");
let ProductImages = require("../models/productimages.model");


// get all items
//======================================================
// router.route("/all").get(async (req, res) => {
//   console.log("it is call ")
//   try {
//     const products = await Products.find({ isActive: true });

//     const productIds = products.map((product) => product._id);

//     const productImages = await ProductImages.find({
//       product_id: { $in: productIds },
//     });
//     console.log(productImages,'=================')
  

//     const productsWithImages = products.map((product) => {
//       const matchingImages = productImages.filter(
//         (image) => String(image.product_id) === String(product._id)
//       );

//       return {
//         _id: product._id,
//         title: product.title,
//         categories_id: product.categories_id,
//         description: product.description,
//         price: product.price,
//         isActive: product.isActive,
//         brands_id: product.brands_id,
//         seo: product.seo,
//         order: product.order,
//         before_price: product.before_price,
//         variants: [],
//         variant_products: [],
//         qty: product.qty,
//         saleqty: product.saleqty,

//         images: matchingImages.map((image) => image.image),
//       };
//     });

//     res.json(productsWithImages);
//   } catch (error) {
//     res.json({
//       message: "Error: " + error,
//       variant: "error",
//     });
//   }
// });


//********************************************** 
router.route("/all").get(async (req, res) => {
  try {
    const userId = req.query.userId;
    let modifiedData = [];

    if (userId) {
      const existingUser = await Users.findOne({ _id: userId });

      if (existingUser) {
        const products = await Products.find({ isActive: true });

        
        const productIds = products.map((product) => product._id);

        const productImages = await ProductImages.find({
          product_id: { $in: productIds },
        });

        modifiedData = products.map((product) => {
          const matchingImages = productImages.filter(
            (image) => String(image.product_id) === String(product._id)
          );

          const isFavourite = existingUser.wishlist.some(
            (wish) => wish.product_id.toString() === product._id.toString()
          );
          console.log(product.variants,'==============varinets======');

          return {
            _id: product._id,
            title: product.title,
            categories_id: product.categories_id,
            description: product.description,
            price: product.price,
            isActive: product.isActive,
            brands_id: product.brands_id,
            seo: product.seo,
            order: product.order,
            before_price: product.before_price,
            variants: product.variants,
            variant_products: [],
            qty: product.qty,
            saleqty: product.saleqty,
            isFavourite,
            // images: matchingImages.map((image) => image.image),
            images: matchingImages.map((image) => {
              // const imageUrl = process.env.PORT + image.image.replace(/\/\//g, "/");
              const imageUrl = "http://localhost:5000/" + image.image.replace(/\\/g, "/");

              return imageUrl;
            }),
            
          };
        });
      }
    } else {
      // If userId is not provided, send products without isFavourite flag
      const products = await Products.find({ isActive: true });

      const productIds = products.map((product) => product._id);

      const productImages = await ProductImages.find({
        product_id: { $in: productIds },
      });

      modifiedData = products.map((product) => {
        const matchingImages = productImages.filter(
          (image) => String(image.product_id) === String(product._id)
        );

        return {
          _id: product._id,
          title: product.title,
          categories_id: product.categories_id,
          description: product.description,
          price: product.price,
          isActive: product.isActive,
          brands_id: product.brands_id,
          seo: product.seo,
          order: product.order,
          before_price: product.before_price,
          variants: [],
          variant_products: [],
          qty: product.qty,
          saleqty: product.saleqty,
          isFavourite: false, // Default to false
        images: matchingImages.map((image) => {
              // const imageUrl = process.env.PORT + image.image.replace(/\/\//g, "/");
              const imageUrl = "http://localhost:5000/" + image.image.replace(/\\/g, "/");

              return imageUrl;
            }),
        };
      });
    }

    res.json(modifiedData);
  } catch (err) {
    res.status(500).json({
      message: "Error: " + err,
      variant: "error",
    });
  }
});




//***************************************** */


// router.route("/all").get(async (req, res) => {
//   try {
//     const userId = req.query.userId;
//     let modifiedData = [];

//     if (userId) {
//       const existingUser = await Users.findOne({ _id: userId });

//       if (existingUser) {
//         const products = await Products.find({ isActive: true });

//         modifiedData = products.map(product => {
//           const isFavourite = existingUser.wishlist.some(wish => wish.product_id.toString() === product._id.toString());
//           return {
//             ...product.toObject(),
//             isFavourite
//           };
//         });
//       }
//     } else {
//       // If userId is not provided, send products without isFavourite flag
//       modifiedData = await Products.find({ isActive: true });
//     }

//     res.json(modifiedData);
//   } catch (err) {
//     res.status(500).json({
//       message: "Error: " + err,
//       variant: "error"
//     });
//   }
// });







//================================================================

router.route("/:seo").get((req, res) => {
  Products.aggregate([
    {
      $match: {
        seo: req.params.seo,
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "productimages",
        localField: "_id",
        foreignField: "product_id",
        as: "allImages",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categories_id",
        foreignField: "_id",
        as: "categories_id",
      },
    },
    {
      $lookup: {
        from: "brands",
        localField: "brands_id",
        foreignField: "_id",
        as: "brands_id",
      },
    },
  ])
    .then((data) => {
      res.json(data);
    })
    .catch((err) =>
      res.json({
        messagge: "Error: " + err,
        variant: "error",
      })
    );
});



router.route("/home").post((req, res) => {
  const user_id=req.body.user_id;
  console.log(req.body.user_id,'==================user id')
  let existingUser;
  if(user_id !== undefined){
    existingUser=Users.findOne({_id:user_id});
  }
  
  
// console.log("aliiiiiiiiiiiiiiiiiiii",existingUser)

  const mongoPost = [
    {
      $match: { isActive: true },
    },
    {
      $lookup: {
        from: "productimages",
        localField: "_id",
        foreignField: "product_id",
        as: "allImages",
      },
    },
    { $sort: req.body.sort },
    { $limit: req.body.limit },
  ];


    if (existingUser !== undefined) {
      mongoPost.push({
        $addFields: {
          isFavourite: {
            $in: [{ $toString: "$_id" }, existingUser.wishlist.map(wish => ({ $toString: wish.product_id }))],
          },
        },
      });
    }
    
  

  Products.aggregate(mongoPost)
    .then((data) => {
      res.json(data);
    })
    .catch((err) =>
      res.json({
        messagge: "Error: " + err,
        variant: "error",
      })
    );
});

router.route("/").post((req, res) => {

  
  const userId = req.query.userId;
  console.log(userId,)

  function functionReplaceObjectID(key, data) {
    const newData = [];
    data.map((val) => {
      const keyAndData = {};
      keyAndData[key] = mongoose.Types.ObjectId(val);
      newData.push(keyAndData);
    });
    return newData;
  }


  const ali=functionReplaceObjectID("categories_id", req.body.categories);

  console.log(ali,'===========================ali============')



  const brandsMongo =
    req.body.brands.length > 0
      ? {
        $or: functionReplaceObjectID("brands_id", req.body.brands),
      }
      : {};

  const skipMongo =
    req.body.skip != 0
      ? {
        $skip: req.body.skip,
      }
      : { $skip: 0 };

  const limitMongo =
    req.body.limit != 0
      ? {
        $limit: req.body.limit,
      }
      : { $limit: 0 };

  const sortMongo =
    typeof req.body.sort === "object"
      ? {
        $sort: req.body.sort,
      }
      : { $sort: { updatedAt: -1 } };

  const categoriesMongo =
    req.body.categories.length > 0
      ? {
        $or: functionReplaceObjectID("categories_id", req.body.categories),
      }
      : {};

  const textMongo =
    req.body.text != ""
      ? {
        $text: {
          $search: `${req.body.text}`,
        },
      }
      : {};

  const mongoPost = [
    {
      $match: {
        $and: [
          {
            isActive: true,
          },
          categoriesMongo,
          brandsMongo,
          textMongo,

          { isActive: true },
          {
            $or: [
              {
                price: {
                  $gte:
                    req.body.minPrice == null || req.body.minPrice == 0
                      ? 1
                      : req.body.minPrice,
                  $lte:
                    req.body.maxPrice == null || req.body.maxPrice == 0
                      ? 1000000000000000000000000000
                      : req.body.maxPrice,
                },
              },
              {
                $and: [
                  { "variant_products.visible": true },

                  {
                    "variant_products.price": {
                      $gte:
                        req.body.minPrice == null || req.body.minPrice == 0
                          ? 1
                          : req.body.minPrice,
                      $lte:
                        req.body.maxPrice == null || req.body.maxPrice == 0
                          ? 1000000000000000000000000000
                          : req.body.maxPrice,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    skipMongo,
    limitMongo,
    sortMongo,

    {
      $lookup: {
        from: "productimages",
        localField: "_id",
        foreignField: "product_id",
        as: "allImages",
      },
    },
  ];

  Products.aggregate(mongoPost)
    .then((data) => {
      res.json(data);
    })
    .catch((err) =>
      res.json({
        messagge: "Error: " + err,
        variant: "error",
      })
    );
});

// router.route("/").post(async (req, res) => {
//   try {
//     const userId = req.query.userId;
//     console.log(userId, '===========================userId');

//     // Fetch user with wishlist data if userId is provided
//     let existingUser;
//     if (userId) {
//       existingUser = await Users.findOne({ _id: userId });
//     }

//     function functionReplaceObjectID(key, data) {
//       const newData = [];
//       data.forEach(val => {
//         const keyAndData = {};
//         keyAndData[key] = mongoose.Types.ObjectId(val);
//         newData.push(keyAndData);
//       });
//       return newData;
//     }

//     const brandsMongo =
//       req.body.brands.length > 0
//         ? {
//             $or: functionReplaceObjectID("brands_id", req.body.brands),
//           }
//         : {};

//     const skipMongo =
//       req.body.skip != 0
//         ? {
//             $skip: req.body.skip,
//           }
//         : { $skip: 0 };

//     const limitMongo =
//       req.body.limit != 0
//         ? {
//             $limit: req.body.limit,
//           }
//         : { $limit: 0 };

//     const sortMongo =
//       typeof req.body.sort === "object"
//         ? {
//             $sort: req.body.sort,
//           }
//         : { $sort: { updatedAt: -1 } };

//     const categoriesMongo =
//       req.body.categories.length > 0
//         ? {
//             $or: functionReplaceObjectID("categories_id", req.body.categories),
//           }
//         : {};

//     const textMongo =
//       req.body.text != ""
//         ? {
//             $text: {
//               $search: `${req.body.text}`,
//             },
//           }
//         : {};

//     // Build the match object for the aggregation pipeline
//     const matchObject = {
//       isActive: true,
//       ...categoriesMongo,
//       ...brandsMongo,
//       ...textMongo,
//       $or: [
//         {
//           price: {
//             $gte: req.body.minPrice || 1,
//             $lte: req.body.maxPrice || Number.MAX_SAFE_INTEGER,
//           },
//         },
//         {
//           $and: [
//             { "variant_products.visible": true },
//             {
//               "variant_products.price": {
//                 $gte: req.body.minPrice || 1,
//                 $lte: req.body.maxPrice || Number.MAX_SAFE_INTEGER,
//               },
//             },
//           ],
//         },
//       ],
//     };

//     if (!userId) {
//       delete matchObject.$or; // Remove the favorite conditions if userId is not provided
//     }

//     // Aggregation pipeline to fetch products
//     const mongoPost = [
//       {
//         $match: matchObject,
//       },
//       skipMongo,
//       limitMongo,
//       sortMongo,
//       {
//         $lookup: {
//           from: "productimages",
//           localField: "_id",
//           foreignField: "product_id",
//           as: "allImages",
//         },
//       },
//     ];

//     if (userId) {
//       mongoPost.push({
//         $addFields: {
//           isFavourite: {
//             $in: [{ $toString: "$_id" }, existingUser.wishlist.map(wish => ({ $toString: wish.product_id }))],
//           },
//         },
//       });
//     }

//     const products = await Products.aggregate(mongoPost);
   
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({
//       message: "Error: " + err,
//       variant: "error",
//     });
//   }
// });




module.exports = router;
