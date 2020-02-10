const config = require('config');
const jwt = require('jsonwebtoken');

function auth(req, res, next){
    const token = req.header('x-auth-token');

    if(!token){
        return  res.status(401).json({msg:'No Token,Authorization Denied'})
    }

    try{
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded;
        next();
    }catch(exception){
        res.status(400).json({msg:'Token invalid'})
    }

}


module.exports = auth;