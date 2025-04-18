const mongoose = require("mongoose")
const slugify = require("slugify")

const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "A tour must have a name!"], 
        unique : true,
        trim : true, 
        maxlength : [40, 'A tour name must have less or equal than 40 characters'],
        minlength : [10, 'A tour name must contain characters greater than 10'],
        
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
       
        enum : {
            values : ['easy', 'medium', 'difficult'],
            message : 'Difficulty is either : easy, medium, difficult'
        }
    },
    ratingsAverage : {
        type : Number,
        default : 4.5, 
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

        validate : { 
            validator : function(val){
                return val < this.val 
            },
            message : 'Discount ({VALUE}) should be less than the actual price'
        }
    },
    summary : {
        type : String,
        required : [true, "A tour must have a summary"],
        trim : true
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
    
    toJSON : { virtuals : true }, 
    toObject : { virtuals : true }
})
 
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7  
})


tourSchema.pre('save', function(next){  
    this.slug = slugify(this.name, {lower : true})
    next()
})


tourSchema.pre(/^find/, function(next){ 
    this.find({secretTour : {$ne : true}})

    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function(doc, next){
    console.log(`Query took ${Date.now()-this.start} milliseconds!`)

    console.log(doc) 
    next()
})

tourSchema.pre('aggregate', function(next){  
    this.pipeline().unshift({$match : {secretTour : {$ne : true}}})
    console.log(this.pipeline())
    next()
})

const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour