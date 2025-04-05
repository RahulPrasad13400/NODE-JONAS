const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit') // npm i express-rate-limit
const helmet = require('helmet') // npm i helmet 
const mongoSanitize = require('express-mongo-sanitize') // npm i express-mongo-sanitize
const xss = require('xss-clean')    // npm i xss-clean
const hpp = require('hpp') // npm i hpp

const AppError = require("./utils/appError")
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const app = express()

// set security HTTP headers
app.use(helmet())

if(process.env.NODE_ENV==="development"){
    app.use(morgan('dev'))
}

// help to prevent brute force attack
const limiter = rateLimit({
    max : 100,
    windowMs : 60*60*1000,   // it allow to send 100 request in 1 hr after the limit is exceded it will send back an error
    message : "Too many requests from this IP. please try again in an hour!"
})
app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(express.json({limit : '10kb'}))

// Data sanitization against noSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS attacks
app.use(xss())

// Prevent parameter pollution
app.use(hpp({
    whitelist : [
        'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
    ]
}))

// serving static files 
app.use(express.static(`${__dirname}/public`)) 



app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString()
    next()
})

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

// ipo oru error route il indengil top ile rand route ilum ponillengi ane thazhe ulla ee route ilott vara 
// all - post, get, delete, put (ellam onich ulathine ane all enn paraya) ( seperate ayitt ellathinum different route ezhuthand irikan vendi )
app.all('*', (req, res, next)=>{
    // res.status(404).json({
    //     status : 'fail',
    //     message : `Can't find ${req.originalUrl} on this server` // orginalUrl is the url that was requested
    // })

    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

// ERROR HANDLING MIDDLEWARE 
// app.use((err, req, res, next)=>{ 
//     err.statusCode = err.statusCode || 500
//     err.status = err.status || 'error'

//     res.status(err.statusCode).json({
//         status : err.status,
//         message : err.message
//     })
// })

app.use(globalErrorHandler)

module.exports = app