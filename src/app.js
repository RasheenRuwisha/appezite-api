const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())


const merchant = require('./routes/merchant/merchant')
const client = require('./routes/client/client')
const ipfs = require('./routes/ipfs/ipfs')
const firebase = require('./routes/firebase/firebase')

app.use('/merchant',merchant)
app.use('/client',client)
app.use('/ipfs',ipfs)
app.use('/firebase',firebase)

app.listen(process.env.PORT || 5005, '0.0.0.0')
