const express = require('express');
const router = express.Router();
const merchantAuth = require('../../../middleware/merchant-auth')
var network = require('./../../fabric/network.js');
const registerUser = require('./../../../registerUser');
var util = require('../../utlity');
const admin = require('firebase-admin');

/**
     * @route GET merchant/getBusiness
     * @desc This method will query for the business using businessId
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
     * @route GET merchant/login
     * @desc This method will login the user after validating  the email and the password
     * @access Public
     *
     */
router.get('/login', (req, res) => {
    network
        .queryUser(req.body.email)
        .then((response) => {
            var userRecord = JSON.parse(response);
            console.log(userRecord);
            if (userRecord.password === req.body.password) {}
        })
        .catch(() => {
            res
                .status(400)
                .json({msg: "User not found."})
        });
})

/**
     * @route POST merchant/queryUser
     * @desc This method will query for the user
     * @access Public
     *
     */
router.post('/queryUser', (req, res) => {
    network
        .queryUser(req.body.email)
        .then((response) => {
            var userRecord = JSON.parse(response);
            res
                .status(200)
                .send(userRecord)
        })
        .catch(() => {
            res
                .status(400)
                .json({msg: "User not found."})
        });
})

/**
     * @route GET merchant/queryAllBusiness
     * @desc This method will query for all the businesses
     * @access Public
     *
     */
router.get('/queryAllBusiness', (req, res) => {
    network
        .queryAllBusiness()
        .then((response) => {
            var businessRecords = JSON.parse(response);
            res
                .status(200)
                .send(businessRecords)
        });
})

/**
     * @route POST merchant/createBusiness
     * @desc This method will create a new business
     * @access Public
     *
     */
router.post('/createBusiness', (req, res) => {
    network
        .queryUser(req.body.email)
        .then((response) => {
            var userRecord = JSON.parse(response);
            if (userRecord.length === 0) {} else {
                res
                    .status(503)
                    .json({msg: "User exists"})
            }
        })
        .catch(() => {
            //Add the new user to the wallte
            registerUser.main(req.body.email, 'businessOwner');
            network
                .createBusiness(req.body.businessId, req.body.name, req.body.email, req.body.country, req.body.password, req.body.phone)
                .then((response) => {
                    util.sendBusinessRegistration(req.body.name, req.body.email);
                    res
                        .status(200)
                        .send({businessId: req.body.businessId, email: req.body.email})
                })
        })
})

/**
     * @route POST merchant/createCategory
     * @desc This method will create a new category
     * @access Private
     *
     */
router.post('/createCategory', merchantAuth, (req, res) => {
    network
        .createCategory(req.body.categoryId, req.user, req.body)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route GET merchant/queryAllCategories
     * @desc This method will  query for all the categories
     * @access Private
     *
     */
router.get('/queryAllCategories', merchantAuth, (req, res) => {
    network
        .queryAllCategories(req.user, req.query.businessId)
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
     * @route POST merchant/updateTheme
     * @desc This method will  update the theme of the business
     * @access Private
     *
     */
router.post('/updateTheme', merchantAuth, (req, res) => {

    // Create app config object
    const appconfig = {
        starterScreen: req.body.starterScreen,
        backgroundImage: req.body.background,
        logo: req.body.logo,
        icon: req.body.icon
    }

    // Create theme object
    const theme = {
        dark: req.body.darkColor,
        light: req.body.lightColor
    }

    network
        .updateTheme(req.body.businessId, req.user, appconfig, theme)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route POST merchant/updateBusiness
     * @desc This method will  update the  business
     * @access Private
     *
     */
router.post('/updateBusiness', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .updateBusiness(req.user, req.body.businessId, req.body)
        .then((response) => {
            res
                .status(200)
                .send(req.body)
        })
})

/**
     * @route POST merchant/updatePickUpHours
     * @desc This method will  update the  business pickup hours
     * @access Private
     *
     */
router.post('/updatePickUpHours', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .updateBusiness(req.user, req.body.businessId, req.body.pickUpHours)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route POST merchant/updatePaypalSecret
     * @desc This method will  update the  business paypal
     * @access Private
     *
     */
router.post('/updatePaypalSecret', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .updateBusiness(req.user, req.body.businessId, req.body.paypalSecret)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route POST merchant/createProduct
     * @desc This method will create a new product
     * @access Private
     *
     */
router.post('/createProduct', merchantAuth, (req, res) => {
    console.log(req.body);
    network
        .createProduct(req.query.businessId, req.user, req.body)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route GET merchant/queryAllProducts
     * @desc This method will query for all the products
     * @access Private
     *
     */
router.get('/queryAllProducts', merchantAuth, (req, res) => {
    network
        .queryAllProducts(req.user, req.query.businessId)
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
     * @route GET merchant/queryAllCategoryProducts
     * @desc This method will query for all the products in a category
     * @access Private
     *
     */
router.get('/queryAllCategoryProducts', merchantAuth, (req, res) => {
    network
        .queryAllCategoryProducts(req.user, req.query.businessId, req.query.categoryId)
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
     * @route GET merchant/removeProduct
     * @desc This method will remove a product using the product id
     * @access Private
     *
     */
router.get('/removeProduct', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .removeProduct(req.query.businessId, req.user, req.query.productId)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route GET merchant/removeCategory
     * @desc This method will remove a category using the category id
     * @access Private
     *
     */
router.get('/removeCategory', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .removeCategory(req.query.businessId, req.user, req.query.categoryId)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route POST merchant/updateProduct
     * @desc This method will update a product
     * @access Private
     *
     */
router.post('/updateProduct', merchantAuth, (req, res) => {
    network
        .updateProduct(req.query.businessId, req.user, req.body)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route POST merchant/updateCategory
     * @desc This method will update a category
     * @access Private
     *
     */
router.post('/updateCategory', merchantAuth, (req, res) => {

    console.log(req.body.name);
    const category = {
        businessId: req.query.businessId,
        name: req.body.name,
        image: req.body.image,
        categoryId: req.body.categoryId
    }
    network
        .updateCategory(req.user, category)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route GET merchant/getBusinessOrder
     * @desc This method will query for all the business orders within a specific date range
     * @access Private
     *
     */
router.get('/getBusinessOrder', merchantAuth, (req, res) => {
    console.log(req.query.status);
    network
        .getBusinessOrders(req.query.businessId, req.user, req.query.startDate, req.query.endDate, req.query.status)
        .then((response) => {
            res.send(JSON.parse(response))
        })
})

/**
     * @route POST merchant/updateOrderStatus
     * @desc This method will update the status of a order using the order id
     * @access Private
     *
     */
router.post('/updateOrderStatus', merchantAuth, (req, res) => {
    console.log(req.body);
    network
        .updatePurchaseOrderStatus(req.user, req.body.status, req.query.businessId, req.body.orderId)
        .then((response) => {
            let resJson = JSON.parse(response)
            var status = req
                .body
                .status
                .toLowerCase()
            status = status
                .charAt(0)
                .toUpperCase() + status.slice(1);
            let subject = `Order ${status} By ${req.body.businessName} | ${resJson.purchaseId}.`
            let msg = `Your Order ${resJson.purchaseId} has been ${status} by ${req.body.businessName}`
            console.log(resJson)
            util.sendOrderUpdate(resJson.customerName, resJson.purchaseId, subject, msg, req.body.businessName, resJson.customerEmail, resJson.notificationTokens,resJson.businessUserNotification)
            res.send(JSON.parse(response))
        })
})

/**
     * @route GET merchant/getOrder
     * @desc This method will query for a order using the order id
     * @access Private
     *
     */
router.get('/getOrder', merchantAuth, (req, res) => {
    console.log(req.body);
    network
        .getPurchaseOrder(req.user, req.query.businessId, req.query.orderId)
        .then((response) => {
            res.send(JSON.parse(response))
        })
})

/**
     * @route POST merchant/updateAPKURL
     * @desc This method will update the business with the APK url
     * @access Private
     *
     */
router.post('/updateAPKURL', (req, res) => {
    console.log(req.body);
    network
        .updateAPKURL(req.body.email, req.body.businessId, req.body.apkurl, req.body.appid)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

/**
     * @route POST merchant/updateOrderPreparationTime
     * @desc This method will update the business order prepartion times
     * @access Private
     *
     */
router.post('/updateOrderPreparationTime', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .updateBusiness(req.user, req.body.businessId, req.body)
        .then((response) => {
            res
                .status(200)
                .send(req.body)
        })
})

/**
     * @route POST merchant/batchUploadProduct
     * @desc This method will batch upload products
     * @access Private
     *
     */
router.post('/batchUploadProduct', merchantAuth, (req, res) => {
    console.log(req.body);
    network
        .batchUploadProduct(req.user, req.query.businessId, req.body)
        .then((response) => {
            res
                .status(200)
                .send(req.body)
        })
})

/**
     * @route GET merchant/getCategoryByName
     * @desc This method will query for a category using name
     * @access Private
     *
     */
router.get('/getCategoryByName', merchantAuth, (req, res) => {
    network
        .getCategoryByName(req.user, req.query.businessId, req.query.name)
        .then((response) => {
            console.log(JSON.stringify(response));

            res.send(JSON.parse(response))
        })
})

/**
     * @route POST merchant/batchUploadCategory
     * @desc This method will batch upload category
     * @access Private
     *
     */
router.post('/batchUploadCategory', merchantAuth, (req, res) => {
    console.log(req.body);
    network
        .batchUploadCategory(req.user, req.query.businessId, req.body)
        .then((response) => {
            res
                .status(200)
                .send(req.body)
        })
})


router.post('/sendNotifications', merchantAuth, (req, res) => {
    console.log(req.user);

    var payload = {
        notification:{
            title:req.body.title,
            body:req.body.msg
        }   
    }

    console.log(req.body.businessFullDetails.notificationTokens)
    admin.messaging().sendToDevice(req.body.businessFullDetails.notificationToken,payload)

    network
        .updateBusiness(req.user, req.body.businessFullDetails.businessId, req.body.businessFullDetails)
        .then((response) => {
            res
                .status(200)
                .send(req.body)
        })
})

module.exports = router;