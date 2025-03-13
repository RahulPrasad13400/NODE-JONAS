const express = require('express')
const morgan = require('morgan')

const AppError = require("./utils/appError")
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const app = express()

if(process.env.NODE_ENV==="development"){
    app.use(morgan('dev'))
}

app.use(express.json())

app.use(express.static(`${__dirname}/public`)) 



app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString()
    next()
})

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

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