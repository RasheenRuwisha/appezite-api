const express = require('express');
const router = express.Router();
const admin = require('firebase-admin')
const serviceAccount = require("./../../../config/notifications-13351-firebase-adminsdk-g56iw-f3e7ffb6c6.json");

admin.initializeApp({
    credential: admin
        .credential
        .cert(serviceAccount),
    databaseURL: "https://notifications-13351.firebaseio.com"
});

router.get('/addApp', async(req, res) => {
    const app = await admin
        .projectManagement()
        .createAndroidApp(req.body.package, req.body.name)
    console.log("New app created " + app.appId)
    return res
        .status(200)
        .json({appid: app.appId})
})

exports.sendNotification = function (msg, tokens) {
    console.log(tokens)
    var payload = {
        notification:{
            title:'Order Status',
            body:msg
        }   
    }
    admin.messaging().sendToDevice(tokens,payload)
}

exports.sendCustomNotification = function (title,msg, tokens) {
    console.log(tokens)
    var payload = {
        notification:{
            title:title,
            body:msg
        }   
    }
    admin.messaging().sendToDevice(tokens,payload)
}


module.exports = router;