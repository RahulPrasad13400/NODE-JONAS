const mongoose = require("mongoose")
const dotenv = require('dotenv')

process.on('uncaughtException', err=>{
    console.log("Uncaught Exception shutting down")
    console.log(err.name, err.message)
    process.exit(1)
})

dotenv.config({path : './config.env'})

const app = require('./app')
 
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then((con)=>console.log("Database connection successfull"))   


const PORT = process.env.PORT || 4000
const server = app.listen(PORT,()=>{
    console.log(`Server Running at PORT ${PORT}`)
})

// unhandled ayitt olla promise rejections handle akan vendi (like catch ilatha case il (try catch))
process.on('unhandledRejection', err=>{
    console.log(err.name, err.message)
    console.log("unhandled rejection shutting down")
    server.close(()=>{  // to exit the app.listen (server.close)
        process.exit(1)
    }) 
}) 

