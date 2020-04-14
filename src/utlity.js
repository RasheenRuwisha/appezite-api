const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
var os = require('os');
const admin = require('firebase-admin')
//Geneated the IDS for business, categories, products and skus

exports.generateID = function (type) {
    var businessId = type;
    var allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var allowedCharactersLength = allowedCharacters.length;
    for (var i = 0; i < 10; i++) {
        businessId += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharactersLength));
    }
    return businessId;
}

exports.getIp = function () {
    var ifaces = os.networkInterfaces();
    var ip = undefined;
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                console.log(ifname + ':' + alias, iface.address);
            } else {
                ip = iface.address;
                console.log(alias,ifname, iface.address);
            }
            ++alias;
        });
    });
    return ip;
}


// send app registration email
exports.sendBusinessRegistration = function (name, email) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'sheen.ruwisha@gmail.com', 
            pass: 'ReApEr12368'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    transporter.use('compile', hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: './src/email-templates',
            layoutsDir: './src/email-templates',
            defaultLayout: 'app-registration.hbs',
        },
        viewPath: './src/email-templates',
        extName: '.hbs'
    }))

    let mailOptions = {
        from: '"Appezite Support" <sheen.ruwisha@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Your business has been created successfully.', // Subject line
        template: 'app-registration', // plain text body
        context: {
            businessName: name
        } // html body, context {replace the context item in the hbs file}
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', {
            msg: 'Email has been sent'
        });
    });
}

// send customer receipt when order is placed
exports.sendCustomerReceipt = function (userName, orderId, subTotal, grandTotal, deliveryCharge, date, businessName, product, email) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
            user: 'sheen.ruwisha@gmail.com',
            pass: 'ReApEr12368'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    transporter.use('compile', hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: './src/email-templates',
            layoutsDir: './src/email-templates',
            defaultLayout: 'customer-receipt.hbs',
        },
        viewPath: './src/email-templates',
        extName: '.hbs'
    }))

    let mailOptions = {
        from: '"Appezite Support" <sheen.ruwisha@gmail.com>', // sender address
        to: email, // list of receivers
        subject: `Your order at ${businessName} has been placed successfully.`, // Subject line
        template: 'app-registration', // plain text body
        context: {
            userName: userName,
            orderId: orderId,
            subTotal: subTotal,
            grandTotal: grandTotal,
            deliveryCharge: deliveryCharge,
            date: date,
            businessName: businessName,
            products: renderProductHtml(product)
        } // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', {
            msg: 'Email has been sent'
        });
    });
}

// send business receipt when order is placed
exports.sendBusinessReceipt = function (request, grandTotal, email,tokens) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
            user: 'sheen.ruwisha@gmail.com', 
            pass: 'ReApEr12368'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    transporter.use('compile', hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: './src/email-templates',
            layoutsDir: './src/email-templates',
            defaultLayout: 'business-receipt.hbs',
        },
        viewPath: './src/email-templates',
        extName: '.hbs'
    }))

    let mailOptions = {
        from: '"Appezite Support" <sheen.ruwisha@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'You have received a new order', // Subject line
        template: 'app-registration', // plain text body
        context: {
            userName: request.customerName,
            orderId: request.purchaseId,
            subTotal: request.total,
            grandTotal: grandTotal,
            deliveryCharge: request.deliveryCharge,
            date: request.orderedAt,
            products: renderProductHtml(request.products),
            comments: request.notes,
            collectionMethod: request.deliveryType,
            number: request.customerNumber
        } // html body
    };

    var payload = {
        notification:{
            title:'New Order',
            body:'New order from '+request.customerName,
            sound:'default'
        }   
    }

    console.log(tokens)
    admin.messaging().sendToDevice(tokens,payload)

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', {
            msg: 'Email has been sent'
        });
    });
}

// send customer receipt when order is updated
exports.sendOrderUpdate = function (userName, orderId, subject, msg, businessName, email,  tokens, businessTokens) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
            user: 'sheen.ruwisha@gmail.com',
            pass: 'ReApEr12368'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    transporter.use('compile', hbs({
        viewEngine: {
            extName: '.hbs',
            partialsDir: './src/email-templates',
            layoutsDir: './src/email-templates',
            defaultLayout: 'order-status.hbs',
        },
        viewPath: './src/email-templates',
        extName: '.hbs'
    }))

    let mailOptions = {
        from: '"Appezite Support" <sheen.ruwisha@gmail.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        template: 'app-registration', // plain text body
        context: {
            userName: userName,
            orderId: orderId,
            msg: msg,
            businessName: businessName
        } // html body
    };

    var payload = {
        notification:{
            title:'Order Status',
            body:msg
        }   
    }

    console.log("asses")

    console.log(businessTokens)
    console.log(tokens)
    
    if(businessTokens != null){
        var userTokens = businessTokens.filter(function(val) {
            return tokens.indexOf(val) != -1;
        });

        if(userTokens.length === 0){
            admin.messaging().sendToDevice(tokens,payload)
        }else{
            admin.messaging().sendToDevice(userTokens,payload)
        }
    }else{
        admin.messaging().sendToDevice(tokens,payload)
    }
    
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.render('contact', {
            msg: 'Email has been sent'
        });
    });
}

renderProductHtml = function (products) {
    var productList = [];
    products
        .map(product =>
            productList.push({
                "product": product.name,
                "price": product.price,
                "qty": product.quantity
            })
        )
    return productList
}