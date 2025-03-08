const mongoose = require("mongoose")
const dotenv = require('dotenv')
dotenv.config({path : './config.env'})

const app = require('./app')
 
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then((con)=>console.log("Database connection successfull"))


const PORT = process.env.PORT || 4000
app.listen(PORT,()=>{
    console.log(`Server Running at PORT ${PORT}`)
})