// To import all the development data to the database 

const fs = require("fs")
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const Tour = require("./../../models/tourModel")
const User = require("./../../models/userModel")
const Review = require("./../../models/reviewModal")
dotenv.config({path : './config.env'})

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
}).then((con)=>console.log("Database connection successfull"))

console.log("i work here")

// READ JSON FILE 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')) 
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8')) 
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')) 

// IMPORT DATA INTO DB 
const importData = async () =>{
    try {
        await Tour.create(tours)
        await User.create(users, {validateBeforeSave : false})
        await Review.create(reviews)
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
        await User.deleteMany()
        await Review.deleteMany()
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

