const AppError = require('./../utils/appError')

const sendErrorDev = (err, res) =>{
    res.status(err.statusCode).json({
    status : err.status,
    err : err,
    message : err.message,
    stack : err.stack
    })
}

// const sendErrorProd = (err, res) => {
//     res.status(err.statusCode).json({
//         status : err.status,
//         message : err.message
//     })
// }

const sendErrorProd = (err, res) => {
    // operational error anengi 
    if(err.isOperational){
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message
        })
        // programming error anengi 
    }else{
        console.log("error : ", err)
        res.status(500).json({
            status : 'error',
            message : "something went wrong!"
        })
    }
}

const handleCastErrorDB = (err) =>{
    const message = `invalid ${err.path} : ${err.value}`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) =>{
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]  
    console.log(value)
    const message = `Duplicate field value : ${value}, please use another value.`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) =>{
        
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `invalid input data, ${errors.join('. ')}`
    return new AppError(message, 400)
}

module.exports = (err, req, res, next) => { 
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    // if(process.env.NODE_ENV === "development"){
        //     res.status(err.statusCode).json({
            //         status : err.status,
            //         err : err,
            //         message : err.message,
            //         stack : err.stack
            //     })
            // }else{
                //     res.status(err.statusCode).json({
                    //         status : err.status,
                    //         message : err.message
                    //     })
                    // }
                    
    if(process.env.NODE_ENV === "development"){
        sendErrorDev(err, res)            
    }else{
        let error = {...err}
        if(error.name === 'CastError') error = handleCastErrorDB(error)
        if(error.code === 11000) error = handleDuplicateFieldsDB(error)
        if(error.name === "ValidationError") error = handleValidationErrorDB(error)
        sendErrorProd(error, res)
    }
}