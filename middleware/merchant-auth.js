const config = require('config');
const jwt = require('jsonwebtoken');

function merchnatAuth(req, res, next){
    const token = req.header('x-merchant-id');

    if(!token){
        return res.status(401).json({msg:'No Token,Authorization Denied'})
    }

    try{
        req.user = token;
        next();
    }catch(exception){
        res.status(400).json({msg:'Token invalid'})
    }

}


module.exports = merchnatAuth;