const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const registerUser = require('./../registerUser');

var network = require('./fabric/network.js');
var util = require('./utlity');
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())
const jwt = require('jsonwebtoken')
const config = require('config');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth')
const merchantAuth = require('../middleware/merchant-auth')

app.get('/getBusiness', (req, res) => {
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
     *
     * This method will login the user after validating  the email and the password
     *
     *
     *
     * @param email
     * @param password
     * @return message
     *
     */
app.get('/login', (req, res) => {
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
     *
     * This method will query for the user
     *
     * @param email
     * @return user details
     *
     */

app.post('/queryUser', (req, res) => {
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
     *
     * This method will query all the existing businesses and this method is only accessible to the admin
     *

     * @return all business details
     *
     */

app.get('/queryAllBusiness', (req, res) => {
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
     *
     * This method will create the business after validating that the email provided by the user is not already exisiting
     *
     * This will also generate the draft business with the given details on the register page
     *
     * @param email
     * @param name
     * @param country
     * @param password
     * @param phone
     * @return business details
     *
     */
app.post('/createBusiness', (req, res) => {
    console.log(req.body);
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
            network
                .queryAllBusiness()
                .then((response) => {
                    console.log(response);
                    var newKey = util.generateID("BIZ_");
                    console.log("registering user");
                    registerUser.main(req.body.email);
                    console.log(newKey);
                    network
                        .createBusiness(newKey, req.body.name, req.body.email, req.body.country, req.body.password, req.body.phone)
                        .then((response) => {
                            res
                                .status(200)
                                .send({businessId: newKey, email: req.body.email})
                        })
                })
        })
})

app.post('/createCategory', merchantAuth, (req, res) => {
    console.log(req.query.email);
    var newKey = util.generateID("CAT_");
    network
        .createCategory(newKey, req.body.name, req.user, req.query.businessId, req.body.image)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.get('/queryAllCategories', merchantAuth, (req, res) => {
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

app.post('/updateTheme', merchantAuth, (req, res) => {
    console.log(req.body.email);
    network
        .updateTheme(req.body.businessId, req.user, req.body.background, req.body.logo, req.body.starterScreen, req.body.darkColor, req.body.lightColor)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.post('/updateBusiness', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .updateBusiness(req.user, req.body.businessId, req.body)
        .then((response) => {
            res
                .status(200)
                .send(req.body)
        })
})

app.post('/updatePickUpHours', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .updateBusiness(req.user, req.body.businessId, req.body.pickUpHours)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.post('/updatePaypalSecret', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .updateBusiness(req.user, req.body.businessId, req.body.paypalSecret)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.post('/createProduct', merchantAuth, (req, res) => {
    console.log(req.user);
    var newKey = util.generateID("PRD_");
    req.body.productId = newKey;
    network
        .createProduct(req.query.businessId, req.user, req.body)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.get('/queryAllProducts', merchantAuth, (req, res) => {
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

app.get('/queryAllCategoryProducts', merchantAuth, (req, res) => {
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

app.get('/removeProduct', merchantAuth, (req, res) => {
    console.log(req.query.email);
    network
        .removeProduct(req.query.businessId, req.user, req.query.productId)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.post('/updateProduct', merchantAuth, (req, res) => {
    network
        .updateProduct(req.query.businessId, req.user, req.body)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.post('/updateCategory', merchantAuth, (req, res) => {
    network
        .updateCategory(req.query.businessId, req.user, req.body.categoryId, req.body.image, req.body.name)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})

app.get('/queryCategory', (req, res) => {
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

app.get('/queryProduct', auth, (req, res) => {
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

// Webstore

app.get('/user/queryAllCategories', (req, res) => {
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

app.get('/user/queryAllProducts', (req, res) => {
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

app.get('/user/queryAllCategoryProducts', (req, res) => {
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

app.get('/user/queryProduct', (req, res) => {
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

app.post('/createBusinessUser', (req, res) => {
    const {businessId, email, password, name} = req.body;
    if (!businessId || !email || !password || !name) {
        return res
            .status(400)
            .json({msg: 'Please enter all details'})
    }
    console.log(req.body);
    console.log("registering user");
    try {
        registerUser.main(req.body.email);
    } catch (err) {}

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err)
                throw err;
            req.body.password = hash
        })
    })

    network
        .createBusinessUser(req.body)
        .then((response) => {
            let userRes = JSON.parse(response);
            if (userRes.msg === 'User alerady exists') {
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
                res
                    .status(200)
                    .send({token, user})
            })
        })
})

app.post('/loginBusinessUser', (req, res) => {
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
            bcrypt
                .compare(req.body.password, user[0].password)
                .then(isMatch => {
                    if (!isMatch)
                        return res.status(400).json({msg: "Invalid credentials"})

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

app.post('/getBusinessUser', auth, (req, res) => {
    console.log("me ass 1");
    console.log(req.user.email);
    const body = {
        businessId: req.body.businessId,
        email: req.user.email
    }
    network
        .loginBusinessUser(body)
        .then((response) => {
            console.log("me ass");
            console.log(JSON.parse(response))
            res.json(JSON.parse(response))
        })
})

app.post('/createBusinessUserCart', auth, (req, res) => {
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
            console.log("me ass");
            console.log(JSON.parse(response))
            res.json(JSON.parse(response))
        })
})

app.post('/addProductBusinessUserCart', auth, (req, res) => {
    console.log(req.body.businessId);
    network
        .createBusinessUserCart(req.body)
        .then((response) => {
            console.log("me ass");
            res.json(JSON.parse(response))
        })
})

app.post('/getBusinessUserCart', auth, (req, res) => {
    console.log("me ass 1");
    console.log(req.user.email);
    const body = {
        businessId: req.body.businessId,
        email: req.user.email
    }
    network
        .getBusinessUserCart(body)
        .then((response) => {
            console.log("me ass");
            res.send(JSON.parse(response))
        })
})


app.post('/placeOrder', auth, (req, res) => {
    console.log(req.user.email);
    var newKey = util.generateID("ORDER_");
    var body = {
        businessId: req.body.businessId,
        products: req.body.products,
        docType: 'PurchaseOrder',
        payment: req.body.payment,
        orderedAt: req.body.orderedAt,
        orderReadyBy: req.body.orderReadyBy,
        delveryType: req.body.delveryType,
        notes: req.body.notes,
        deliveryAddress: req.body.deliveryAddress,
        customerEmail: req.user.email,
        purchaseId:newKey,
        status:req.body.status,
        platform:req.body.platfrom,
        customerName:req.body.customerName
    }
    network
        .createPurchaseOrder(body)
        .then((response) => {
            console.log("me ass");
            console.log(JSON.parse(response))
            res.json((body))
        })
})


app.get('/getBusinessUserOrder', auth, (req, res) => {
    console.log("me ass 1");
    console.log(req.user.email);
    network
        .getUserOrders(req.query.businessId,req.user.email)
        .then((response) => {
            console.log("me ass");
            res.send(JSON.parse(response))
        })
})


app.get('/getBusinessOrder', merchantAuth, (req, res) => {
    console.log("me ass 1");
    console.log(req.query.status);
    network
        .getBusinessOrders(req.query.businessId,req.user,req.query.startDate,req.query.endDate,req.query.status)
        .then((response) => {
            console.log("me ass");
            res.send(JSON.parse(response))
        })
})



app.post('/updateOrderStatus', merchantAuth, (req, res) => {
    console.log(req.body);
    network
        .updatePurchaseOrderStatus(req.user,req.body.status,req.query.businessId,req.body.orderId)
        .then((response) => {
            res.send(JSON.parse(response))
        })
})




app.post('/updateAPKURL', (req, res) => {
    console.log(req.body);
    network
        .updateAPKURL(req.body.email, req.body.businessId, req.body.apkurl)
        .then((response) => {
            res
                .status(200)
                .send(response)
        })
})


// Webstore ends app.post('/toggleTask', (req, res) => {
// network.toggleCompleted(req.body.key)       .then((response) => {
// res.send(response)       }) })

app.listen(process.env.PORT || 8081)
