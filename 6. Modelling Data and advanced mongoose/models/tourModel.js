const mongoose = require("mongoose")
const slugify = require("slugify")
const User = require("./userModel")

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
        max : [5, 'Rating must be below 5.0'],
        set : val => Math.round(val*10)/10
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
    },
    startLocation : {
        // GEO JSON
        type : {
            type : String,
            default : 'Point',
            enum : ['Point']
        },
        coordinates : [Number],
        address : String,
        description : String
    },
    locations : [
        {
            type : {
                type : String,
                default : 'Point',
                enum : ['Point']
            }, 
            coordinates : [Number],
            address : String,
            description : String,
            day : Number
        }
    ],
    // guides : Array
    guides : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'User'
        }
    ]
    // ,reviews : [
    //     {
    //         type : mongoose.Schema.ObjectId,
    //         ref : 'Review'
    //     }
    // ]
},{
    
    toJSON : { virtuals : true }, 
    toObject : { virtuals : true }
})

// tourSchema.index({price : 1}) // 1 means ascending, -1 means descending 
tourSchema.index({ price : 1, ratingsAverage : -1})
tourSchema.index({slug : 1})
tourSchema.index({startLocation : '2dsphere'})
 
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7  
})

// VIRTUAL POPULATE 
tourSchema.virtual('reviews',{
    ref : 'Review',
    foreignField : 'tour',
    localField : '_id'
})

tourSchema.pre('save', function(next){  
    this.slug = slugify(this.name, {lower : true})
    next()
}) 

// Embedding (id mathram ane pass cheyanath, aa id vech complete object kand pidich aa id ye replace cheyanam)
// tourSchema.pre('save', async function(next){
//     const guidePromises = this.guides.map(async (id) => await User.findById(id))
//     this.guides = await Promise.all(guidePromises)
//     next()
// })


tourSchema.pre(/^find/, function(next){ 
    this.find({secretTour : {$ne : true}})

    this.start = Date.now()
    next()
})

tourSchema.pre(/^find/, function(next){
    this.populate({
        path : 'guides',
        select : '-__v -passwordChangedAt'
    })
    next()
})

tourSchema.post(/^find/, function(doc, next){
    console.log(`Query took ${Date.now()-this.start} milliseconds!`)

    // console.log(doc) 
    next()
})

// tourSchema.pre('aggregate', function(next){  
//     this.pipeline().unshift({$match : {secretTour : {$ne : true}}})
//     // console.log(this.pipeline())
//     next()
// })

const Tour = mongoose.model('Tour', tourSchema)
module.exports = Tour