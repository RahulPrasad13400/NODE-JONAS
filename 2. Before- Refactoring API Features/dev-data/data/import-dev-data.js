// To import all the development data to the database 

const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const Tour = require("./../../models/tourModel")
dotenv.config({path : './config.env'})

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then((con)=>console.log("Database connection successfull"))

// READ JSON FILE 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')) 

// IMPORT DATA INTO DB 
const importData = async () =>{
    try {
        await Tour.create(tours)
        console.log("Data successfully loaded!")
        process.exit()
    } catch (error) {
        console.log(error.message)
    }
}

// DELETE ALL DATA FROM COLLECTION 
const deleteData = async () =>{
    try {
        await Tour.deleteMany()
        console.log("Data deleted successfully!")
        process.exit()
    } catch (error) {
        console.log(error.message)
    }
}

if(process.argv[2]==="--import"){
    importData()
}else if(process.argv[2] === "--delete"){
    deleteData()
}

