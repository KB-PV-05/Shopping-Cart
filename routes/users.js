var express = require("express");
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const usersHelpers = require("../helpers/users-helpers");
const verifyLogin = (req, res, next) => {
  if (req.session.userloggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};


router.get("/", async function (req, res, next) {
  let user = req.session.user;
  console.log(user);
  let cartCount = null;
  if (req.session.user) {
    cartCount = await usersHelpers.getCartCount(req.session.user._id);
  }
  productHelpers.getAllProducts().then((products) => {
    res.render("users/view-products", { products, user, cartCount });
  });
});

router.get("/login", (req, res) => {
  if (req.session.userloggedIn) {
    res.redirect("/");
  } else {
    res.render("users/login", { loginErr: req.session.userloginErr });
    req.session.userloginErr = false;
  }
});

router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post("/signup", (req, res) => {
  usersHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.user = response;
    req.session.userloggedIn = true;
    res.redirect("/");
  });
});

router.post("/login", (req, res) => {
  usersHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.userloggedIn = true;
      res.redirect("/");
    } else {
      req.session.userloginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userloggedIn = false;
  res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {
  let products = await usersHelpers.getCartProducts(req.session.user._id);
  let totalValue = 0;
  if (products.length > 0) {
    totalValue = await usersHelpers.getTotalAmount(req.session.user._id);
  }
  console.log(products);
  console.log(req.session.user);
  res.render("users/cart", { products, user: req.session.user, totalValue });
});

router.get("/add-to-cart/:id", (req, res) => {
  console.log("api call");
  usersHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post("/change-product-quantity", (req, res, next) => {
  console.log(req.body);
  usersHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await usersHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});

router.post('/delete-product', (req, res) => {
  console.log(req.body);
  usersHelpers.deleteCartProduct(req.body).then((response) => {
    res.json(response)
  })
})

router.get("/place-order", verifyLogin, async (req, res) => {
  let total = await usersHelpers.getTotalAmount(req.session.user._id);
  res.render("users/place-order", { total, user: req.session.user });
});

router.post("/place-order", async (req, res) => {
  let products = await usersHelpers.getCartProductList(req.body.userId);
  let totalPrice = await usersHelpers.getTotalAmount(req.body.userId);
  usersHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    res.json({ status: true });
  });
});

router.get("/order-success", (req, res) => {
  res.render("users/order-success", { user: req.session.user });
});

router.get("/orders", async (req, res) => {
  let orders = await usersHelpers.getUserOrders(req.session.user._id);
  res.render("users/orders", { user: req.session.user, orders });
});

router.get("/view-order-products/:id", async (req, res) => {
  let products = await usersHelpers.getOrderProducts(req.params.id);
  res.render("users/view-order-products", { user: req.session.user, products });
});

router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  usersHelpers
    .verifyPayment(req.body)
    .then(() => {
      usersHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
      });
    })
    .catch((err) => {
      console.log("Payment verification failed");
      res.json({ status: false, errMsg: "Payment verification failed" });
    });
});



module.exports = router;

