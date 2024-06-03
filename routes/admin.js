var express = require('express');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers');
var adminHelpers = require('../helpers/admin-helpers');

const verifyLogin = (req, res, next) => {
    if (req.session.adminLoggedIn) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

router.get('/', verifyLogin, function(req, res, next) {
    productHelpers.getAllProducts().then((products) => {
        res.render('admin/view-products', { admin: true, products });
    });
});

router.get('/user-orders/:userId', verifyLogin, async (req, res) => {
    let userId = req.params.userId;
    let userData = await adminHelpers.getUserById(userId); // Assuming this function fetches user data
    let userOrders = await productHelpers.getUserOrders(userId);
    res.render('admin/user-orders', { userData, userOrders, admin: req.session.admin });
});

router.get('/add-product', verifyLogin, function(req, res) {
    res.render('admin/add-product');
});

router.post('/add-product', verifyLogin, (req, res) => {
    productHelpers.addProduct(req.body, (insertedId) => {
        let image = req.files.Image;
        image.mv('./public/product-images/' + insertedId + '.jpg', (err) => {
            if (!err) {
                res.redirect('/admin');
            } else {
                console.log(err);
                res.redirect('/admin/add-product');
            }
        });
    });
});

router.get('/delete-product/:id', verifyLogin, (req, res) => {
    let proId = req.params.id;
    productHelpers.deleteProduct(proId).then(() => {
        res.redirect('/admin/');
    });
});

router.get('/edit-product/:id', verifyLogin, async(req, res) => {
    let product = await productHelpers.getProductDetails(req.params.id);
    res.render('admin/edit-product', { product });
});

router.post('/edit-product/:id', verifyLogin, (req, res) => {
    let insertedId = req.params.id;
    productHelpers.updateProduct(req.params.id, req.body).then(() => {
        if (req.files.Image) {
            let image = req.files.Image;
            image.mv('./public/product-images/' + insertedId + '.jpg');
        }
        res.redirect('/admin');
    });
});

router.get('/login', (req, res) => {
    if (req.session.adminLoggedIn) {
        res.redirect('/admin');
    } else {
        res.render('admin/login', { "loginErr": req.session.adminLoginErr, admin: true });
        req.session.adminLoginErr = false;
    }
});

router.post('/login', (req, res) => {
    adminHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.admin = response.admin;
            req.session.adminLoggedIn = true;
            res.redirect('/admin');
        } else {
            req.session.adminLoginErr = "Invalid email or password";
            res.redirect('/admin/login');
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.admin = null;
    req.session.adminLoggedIn = false;
    res.redirect('/admin');
});

router.get('/all-orders', verifyLogin, async (req, res) => {
    try {
        let orders = await productHelpers.getAllOrders();
        res.render('admin/all-orders', { admin: req.session.admin, orders });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/change-order-status', (req, res) => {
    productHelpers.changeOrderStatus(req.body.orderId, req.body.orderStatus).then((orderStatus) => {
        res.json({ orderStatus });
    });
});

router.get('/all-users', verifyLogin, async(req, res) => {
    let users = await adminHelpers.getAllUsers();
    res.render('admin/all-users', { users, admin: req.session.admin });
});

module.exports = router;
