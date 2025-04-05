const mongoose = require('mongoose')
const Tour = require('./tourModel')

// PARENT REFERENCING 
const reviewSchema = new mongoose.Schema({
    review : {
        type : String,
        required : [true, 'Review cannot be empty']
    },
    rating : {
        type : Number,
        min : 1,
        max : 5
    },
    createdAt : {
        type : Date,
        default : Date.now 
    },
    // PARENT REFERENCING
    tour : {
        type : mongoose.Schema.ObjectId,
        ref : "Tour",
        required : [true, 'Review must belong to a tour']
    },
    // PARENT REFERENCING
    user : {
        type : mongoose.Schema.ObjectId,
        ref : "User",
        required : [true, 'Review must belong to a user']
    }
}, {
    toJSON : { virtuals : true},
    toObject : { virtuals : true}
})

// to prevent duplicate reviews 
reviewSchema.index({tour : 1, user : 1}, {unique : true})

reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path : 'tour',
    //     select : 'name'
    // }).populate({
    //     path : 'user',
    //     select : 'name photo'
    // })

    this.populate({
        path : 'user',
        select : "name photo"
    })
    next()  
})

reviewSchema.static.calcAverageRatings = async function(tourId){
    // in this we are using aggregate on the modal so we have to use static method 
    const stats = this.aggregate([ // this keyword currently points towards the model 
        {
            $match : { tour : tourId }
        },
        {
            $group : { 
                _id : '$tour',
                nRating : { $sum : 1 },
                avgRating : { $avg : '$rating'}
            }
        }
    ])
    
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : stats[0].nRating,
            ratingsAverage : stats[0].avgRating 
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : 0,
            ratingsAverage : 0 
        })        
    }
}

reviewSchema.post('save', function(next){
    // this point to the current review
    this.constructor.calcAverageRatings(this.tour) // this.constructor points towards the current modal (the modal is declared below this so to access it we have to user this.constructor)
    next()
})

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await this.findOne()
    next()
})

reviewSchema.post(/^findOneAnd/, async function(next){
    // await this.findOne(), dosen't work here query has already executed (post ayath kond)
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review

