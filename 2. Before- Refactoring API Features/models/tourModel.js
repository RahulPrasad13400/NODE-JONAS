const mongoose = require("mongoose")

const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "A tour must have a name!"], // This field is required 
        unique : true,
        trim : true // All the blank or white spaces will be removed 
    },  
    duration : {
        type : Number,
        requried : [true, "A tour must have a duration"]
    },
    maxGroupSize : {
        type : Number,
        required : [true, "A tour must have a max group size"]
    },
    difficulty : {
        type : String,
        required : [true, 'A tour must have a difficulty']
    },
    ratingsAverage : {
        type : Number,
        default : 4.5 // we can give a default value like this or giving default values 
    },
    ratingsQuantity : {
        type : Number,
        default : 0
    },
    price : { 
        type : Number,
        required : [true, "A tour must have a price!"] 
    },
    priceDiscount : Number,
    summary : {
        type : String,
        required : [true, "A tour must have a summary"],
        trim : true // it remove all the white spaces or blank spaces 
    },
    description : {
        type : String,
        trim : true,
    },
    imageCover : {
        type : String,
        required : [true, "A tour must have a image!"],
    },
    images : [String], 
    createdAt : {
        type : Date,
        default : Date.now(),
        select : false 
    },
    startDates : [Date]
})

const Tour = mongoose.model('Tour', tourSchema)

// const testTour = new Tour({
// name : "The Forest Hiker",
//     reting : 5,
//     price : 400
// }) 
// // testTour.save() // it will save to the database 
// testTour.save().then(data=>console.log(data)).catch(err=>console.log(err))

module.exports = Tour