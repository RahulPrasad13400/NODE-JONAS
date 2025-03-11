const mongoose = require("mongoose")
const slugify = require("slugify")
// const validator = require("validator")

const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "A tour must have a name!"], // This field is required 
        unique : true,
        trim : true, // All the blank or white spaces will be removed 
        maxlength : [40, 'A tour name must have less or equal than 40 characters'],
        minlength : [10, 'A tour name must contain characters greater than 10'],
        // validate : [validator.isAlpha, 'Tour name must only contain characters']
    },  
    slug : String,
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
        required : [true, 'A tour must have a difficulty'],
        // enum : ["easy", "medium", "difficult"]
        enum : {
            values : ['easy', 'medium', 'difficult'],
            message : 'Difficulty is either : easy, medium, difficult'
        }
    },
    ratingsAverage : {
        type : Number,
        default : 4.5, // we can give a default value like this or giving default values 
        min : [1, 'Rating must be above 1.0'],
        max : [5, 'Rating must be below 5.0']
    },
    ratingsQuantity : {
        type : Number,
        default : 0
    },
    price : { 
        type : Number,
        required : [true, "A tour must have a price!"] 
    },
    priceDiscount : {
        type : Number,
        // validate : function(val){   // custom validators 
        //     return val < this.price
        // }
        validate : { 
            validator : function(val){
                // THIS VALIDATORS WORK ONLY WHEN NEW DOC CREATED AND NOT ON UPDATION 
                // this only points to current doc on NEW document creation
                return val < this.val 
            },
            message : 'Discount ({VALUE}) should be less than the actual price'
        }
    },
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
    startDates : [Date],
    secretTour : {
        type : Boolean,
        default : false 
    }
},{
    // VIRTUAL PROPERTIES 
    toJSON : { virtuals : true }, 
    toObject : { virtuals : true }
})

// const Tour = mongoose.model('Tour', tourSchema)
// const testTour = new Tour({
// name : "The Forest Hiker",
//     reting : 5,
//     price : 400
// }) 
// // testTour.save() // it will save to the database 
// testTour.save().then(data=>console.log(data)).catch(err=>console.log(err))


// VIRTUAL PROPERTIES 
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7  
})


// DOCUMENT MIDDLEWARE  (only runs before save and create)
tourSchema.pre('save', function(next){  // each middleware has access to next, for calling the next middleware
    this.slug = slugify(this.name, {lower : true})
    next()
})

// tourSchema.post('save', function(doc, next){    // post middleware has access to both doc and next 
//     console.log(doc)
//     next()
// })


// QUERY MIDDLEWARE 
// pre runs before any query is executed 
// tourSchema.pre('find', function(next){ // this keyword points towards the current query not towards the doc 
//     this.find({secretTour : {$ne : true}})
//     next()
// }) // it only runs for find, it dosen't for findOne so by using regular expression we can make it run for all find
tourSchema.pre(/^find/, function(next){ // this keyword points towards the current query not towards the doc 
    this.find({secretTour : {$ne : true}})

    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function(doc, next){
    console.log(`Query took ${Date.now()-this.start} milliseconds!`)

    console.log(doc) 
    next()
})

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next){  // this keyword points towards the aggregation
    this.pipeline().unshift({$match : {secretTour : {$ne : true}}})
    console.log(this.pipeline())
    next()
})

const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour