const express = require('express')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const app = express()

if(process.env.NODE_ENV==="development"){
    app.use(morgan('dev'))
}

// MIDDLEWARES 
app.use(express.json())

// http://localhost:4000/overview.html
app.use(express.static(`${__dirname}/public`)) // serving static file (video-66)



app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString()
    next()
})


// app.get('/api/v1/tours', getAllTours)
// app.get('/api/v1/tours/:id', getTour)
// app.post('/api/v1/tours', createTour)
// app.patch('/api/v1/tours/:id', updateTour) // UPDATE 
// app.delete('/api/v1/tours/:id', deleteTour) // DELETE 

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

module.exports = app