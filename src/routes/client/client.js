const express = require('express');
const router = express.Router();
const auth = require('../../../middleware/auth')
var network = require('./../../fabric/network.js');
var util = require('../../utlity');

const jwt = require('jsonwebtoken')
const config = require('config');
const bcrypt = require('bcryptjs');
const registerUser = require('./../../../registerUser');

  /**
     * @route GET client/getBusiness
     * @desc This method will retreive the businessDetails
     * @access Public
     *
     */
router.get('/getBusiness', (req, res) => {
    network
        .queryBusiness(req.query.businessId)
        .then((response) => {
            var userRecord = JSON.parse(response);
            res
                .status(200)
                .send(userRecord)
        })
        .catch(() => {
            res
                .status(400)
                .send("Business not found.")
        });
})

  /**
     * @route GET client/queryCategory
     * @desc This method will retreive the business categories
     * @access Public
     *
     */
router.get('/queryCategory', (req, res) => {
    network
        .queryCategory(req.query.email, req.query.categoryId)
        .then((response) => {
            console.log(response)
            var businessRecords = JSON.parse(response);
            res
                .status(200)
                .send(businessRecords)
        });
})

/**
     * @route GET client/queryProduct
     * @desc This method will retreive the product using the product id
     * @access Public
     *
     */
router.get('/queryProduct', (req, res) => {
    network
        .queryProduct(req.query.email, req.query.productId)
        .then((response) => {
            console.log(response)
            var businessRecords = JSON.parse(response);
            res
                .status(200)
                .send(businessRecords)
        });
})

/**
     * @route GET client/queryAllCategories
     * @desc This method will query for all the categories in the business
     * @access Public
     *
     */
router.get('/queryAllCategories', (req, res) => {
    network
        .queryAllCategories(req.query.email, req.query.businessId)
        .then((response) => {
            var categoryRecords = JSON.parse(response);
            res
                .status(200)
                .send(categoryRecords)
        })
        .catch((err) => {
            res
                .status(400)
                .send(err)
        });
})

/**
     * @route GET client/queryAllProducts
     * @desc This method will query for all the products in the business
     * @access Public
     *
     */
router.get('/queryAllProducts', (req, res) => {
    network
        .queryAllProducts(req.query.email, req.query.businessId)
        .then((response) => {
            var categoryRecords = JSON.parse(response);
            res
                .status(200)
                .send(categoryRecords)
        })
        .catch((err) => {
            res
                .status(400)
                .send(err)
        });
})

/**
     * @route GET client/queryAllCategoryProducts
     * @desc This method will query for all the products in the category
     * @access Public
     *
     */
router.get('/queryAllCategoryProducts', (req, res) => {
    network
        .queryAllCategoryProducts(req.query.email, req.query.businessId, req.query.categoryId)
        .then((response) => {
            var categoryRecords = JSON.parse(response);
            res
                .status(200)
                .send(categoryRecords)
        })
        .catch((err) => {
            res
                .status(400)
                .send(err)
        });
})

/**
     * @route GET client/queryProduct
     * @desc This method will query for a products using the product id
     * @access Public
     *
     */
router.get('/queryProduct', (req, res) => {
    network
        .queryProduct(req.query.email, req.query.productId)
        .then((response) => {
            console.log(response)
            var businessRecords = JSON.parse(response);
            res
                .status(200)
                .send(businessRecords)
        });
})

/**
     * @route POST client/createBusinessUser
     * @desc This method will create a new user for the business
     * @access Public
     *
     */
router.post('/createBusinessUser', (req, res) => {
    const {businessId, email, password, name, phone} = req.body;
    if (!businessId || !email || !password || !name || !phone) {
        return res
            .status(400)
            .json({msg: 'Please enter all details'})
    }
    console.log(req.body);
    console.log("registering user");
    try {
        registerUser.main(req.body.email,'businessConsumer');
    } catch (err) {}

    // hash the password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err)
                throw err;
            req.body.password = hash
        })
    })

console.log(req.body.phone)
    network
        .createBusinessUser(req.body)
        .then((response) => {
            let userRes = JSON.parse(response);
            if (userRes.msg === 'User alerady exists') {
              console.log("user exist")
                return res
                    .status(400)
                    .json({msg: 'User already exists'})
            }
            let user = JSON.parse(response)
            jwt.sign({
                email: user.email,
            }, config.get('jwtSecret'), {
            }, (err, token) => {
                if (err)
                    throw err

                console.log({token, user})
                res
                    .status(200)
                    .send({token, user})
            })
        })
})

/**
     * @route POST client/loginBusinessUser
     * @desc This method will loing a user for the business
     * @access Public
     *
     */
router.post('/loginBusinessUser', (req, res) => {
    const {businessId, email, password} = req.body;
    if (!businessId || !email || !password) {
        return res
            .status(400)
            .json({msg: 'Please enter all details'})
    }
    console.log(req.body);
    network
        .loginBusinessUser(req.body)
        .then((response) => {
            console.log(JSON.stringify(response))
            if (response.error === 'An identity for the user admin does not exist in the wallet. Register admin firs' +
                    't') {
                return res
                    .status(400)
                    .json({msg: "User Not Registered"})
            }
            let user = JSON.parse(response);
            // compare passwords
            bcrypt
                .compare(req.body.password, user[0].password)
                .then(isMatch => {
                    if (!isMatch)
                        return res.status(400).json({msg: "Invalid credentials"})
                    // create jwt for authentication
                    jwt.sign({
                        email: user[0].email
                    }, config.get('jwtSecret')
                    , (err, token) => {
                        if (err)
                            throw err
                        res
                            .status(200)
                            .send({token, user})
                    })
                })
        })

})

/**
     * @route POST client/getBusinessUser
     * @desc This method will retreive tge details of logged in user
     * @access Private
     *
     */
router.post('/getBusinessUser', auth, (req, res) => {
    console.log(req.user.email);
    const body = {
        businessId: req.body.businessId,
        email: req.user.email
    }
    network
        .loginBusinessUser(body)
        .then((response) => {
            console.log(JSON.parse(response))
            res.json(JSON.parse(response))
        })
})

/**
     * @route POST client/createBusinessUserCart
     * @desc This method will retreive the cart of the logged user
     * @access Private
     *
     */
router.post('/createBusinessUserCart', auth, (req, res) => {
    console.log(req.body.businessId);
    var newKey = util.generateID("CART_");
    req.body.cartId = newKey;
    const body = {
        businessId: req.body.businessId,
        customerEmail: req.user.email,
        cartId: newKey,
        products: [],
        docType: "Cart"
    }
    network
        .createBusinessUserCart(body)
        .then((response) => {
            console.log(JSON.parse(response))
            res.json(JSON.parse(response))
        })
})

/**
     * @route POST client/addProductBusinessUserCart
     * @desc This method will add new item to the user cart
     * @access Private
     *
     */
router.post('/addProductBusinessUserCart', auth, (req, res) => {
    console.log(req.body.businessId);
    network
        .createBusinessUserCart(req.body)
        .then((response) => {
            res.json(JSON.parse(response))
        })
})

/**
     * @route POST client/getBusinessUserCart
     * @desc This method will query for the logged in users cart
     * @access Private
     *
     */
router.post('/getBusinessUserCart', auth, (req, res) => {
    console.log(req.user.email);
    const body = {
        businessId: req.body.businessId,
        email: req.user.email
    }
    network
        .getBusinessUserCart(body)
        .then((response) => {
            res.send(JSON.parse(response))
        })
})


/**
     * @route POST client/placeOrder
     * @desc This method will place order for the business
     * @access Private
     *
     */
router.post('/placeOrder', auth, (req, res) => {
    console.log(req.user.email);
    var newKey = util.generateID("ORDER_");
    var body = {
        businessId: req.body.businessId,
        products: req.body.products,
        docType: 'PurchaseOrder',
        payment: req.body.payment,
        orderedAt: req.body.orderedAt,
        orderReadyBy: req.body.orderReadyBy,
        deliveryType: req.body.delveryType,
        notes: req.body.notes,
        deliveryAddress: req.body.deliveryAddress,
        customerEmail: req.user.email,
        purchaseId:newKey,
        status:req.body.status,
        platform:req.body.platfrom,
        customerName:req.body.customerName,
        total:req.body.total,
        deliveryCharge:req.body.deliveryCharge,
        customerNumber:req.body.customerNumber,
        notificationTokens:req.body.notificationTokens,
        businessNotification:req.body.businessNotification,
        businessUserNotification:req.body.businessUserNotification
    }
    network
        .createPurchaseOrder(body)
        .then((response) => {
            console.log(JSON.parse(response))
            let grandTotal = body.total + body.deliveryCharge;
            util.sendCustomerReceipt(body.customerName, body.purchaseId, body.total, grandTotal, body.deliveryCharge, body.orderedAt, req.body.businessName, body.products, body.customerEmail)
            util.sendBusinessReceipt(body, grandTotal, req.body.businessEmail,req.body.businessNotification)
            res
                .status(200)
                .send(JSON.parse(response))
        })
})


/**
     * @route GET client/getBusinessUserOrder
     * @desc This method will query fir the logged in users orders
     * @access Private
     *
     */
router.get('/getBusinessUserOrder', auth, (req, res) => {
    console.log(req.user.email);
    network
        .getUserOrders(req.query.businessId,req.user.email)
        .then((response) => {
            res.send(JSON.parse(response))
        })
})




module.exports = router;