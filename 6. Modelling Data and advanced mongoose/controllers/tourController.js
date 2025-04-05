const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

const catchAsync = require('../utils/catchAsync')
// const catchAsync = fn =>{ 
//     return (req, res, next) =>{
//         fn(req, res, next).catch(err=> next(err))
//     } 
// }

// exports.getAllTours = catchAsync( async (req, res, next)=>{

//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
//     const tours = await features.query
    
//     res.status(200).json({
//         status : "success",
//         results : tours.length,
//         data : {
//             tours
//         }
//     })
// })

exports.getAllTours = factory.getAll(Tour)

// exports.getTour = catchAsync( async (req, res, next)=>{
//     const {id} = req.params
//         // const tour = await Tour.findById(id)
//         // const tour = await Tour.findById(id).populate('guides')
//         // const tour = await Tour.findById(id).populate({
//             //     path : 'guides',
//             //     select : '-__v -passwordChangedAt'
//             // })
//         const tour = await Tour.findById(id).populate('reviews')

//         if(!tour){ 
//             return next(new AppError(`No Tour found with that ID`, 404))
//         }

//         res.status(200).json({
//             status : "success",
//             data : {
//                 tour
//             }
//         })
// })

exports.getTour = factory.getOne(Tour, {path : 'reviews'})
  
// exports.createTour = catchAsync( async (req, res, next)=>{
//         const newTour = await Tour.create(req.body)

//         res.status(200).json({ 
//             status : "success",
//             data : {
//                 tour : newTour
//             }
//         })
// })

exports.createTour = factory.createOne(Tour)

// exports.updateTour = catchAsync( async (req, res, next)=>{
//         const {id} = req.params
//         const tour = await Tour.findByIdAndUpdate(id, req.body, {
//             new : true,
//             runValidators : true 
//         })

//         if(!tour){
//             return next(new AppError(`No Tour found with that ID`, 404))
//         }

//         res.status(200).json({
//             status : "success",
//             data : {
//                 tour
//             }
//         })
// })

exports.updateTour = factory.updateOne(Tour)

// exports.deleteTour = catchAsync( async (req, res, next)=>{
//     const {id} = req.params
//         const tour = await Tour.findByIdAndDelete(id)
//         if(!tour){
//             return next(new AppError(`No Tour found with that ID`, 404))
//         }
//         res.status(200).json({
//             status : "success",
//             data : null 
//         })
// })
exports.deleteTour = factory.deleteOne(Tour)

exports.aliasTopTours = catchAsync( async (req, res, next) =>{
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
})  

exports.getTourStats = catchAsync( async (req, res, next) =>{
        const stats = await Tour.aggregate([
            {
                $match : {ratingsAverage : {$gte : 4.5} }   
            },
            {
                $group : {
                    _id : {$toUpper : '$difficulty'},   
                    numTours : {$sum : 1},
                    numRatings : {$sum : '$ratingsQuantity'},
                    avgRating : {$avg : '$ratingsAverage'} ,
                    avgPrice : {$avg : '$price'},
                    minPrice : {$min : '$price'},
                    maxPrice : {$max : '$price'}
                }
            },
            {
                $sort : {
                    avgPrice : 1
                }
            },
        ])

        res.status(200).json({
            status : "success",
            data : {
                stats 
            }
        })

})

exports.getMonthlyPlan = catchAsync( async (req, res, next) => {

        const year = req.params.year*1

        const plan = await Tour.aggregate([
            {
                $unwind : '$startDates'
            },
            {
                $match : {
                    startDates : {
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group : {
                    _id : {$month : '$startDates'},
                    numTourStarts : {$sum : 1},
                    tours : {$push : '$name'}
                }
            },
            {
                $addFields : {
                    month : '$_id'
                }
            },
            {
                $project : {
                    _id : 0
                }
            },
            {
                $sort : {numTourStarts : 1}  
            },
            {
                $limit : 12          
            }
        ])

        res.status(200).json({
            status : "success",
            data : {
                plan 
            }
        })

})

exports.getToursWithin = catchAsync( async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1

    if(!lat || !lng){
        next(new AppError("please provide lat and lng in the format lat,lng", 400))
    }

    const tours = await Tour.find({ 
        startLocation : { $geoWithin : { $centerSphere : [[lng, lat], radius]} }})

    res.status(200).json({
        status : "success",
        data : {
            data : tours
        }
    })
})

exports.getDistances = catchAsync( async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    const multiplier = unit === "mi" ? 0.000621371 : 0.001 

    if(!lat || !lng){
        next(new AppError("please provide lat and lng in the format lat,lng", 400))
    }

    const distances = await Tour.aggregate([
        {   // geoNear need to be the first operator on the pipeline
            $geoNear : {
                near : {
                    type : "Point",
                    coordinates : [lng*1, lat*1], // multiplied by 1 ( convert to number )
                },
                distanceField : 'distance',
                distaceMultiplier : multiplier 
            }
        },
        {
            $project : {
                distance : 1, 
                name : 1
            }
        }
    ])

    res.status(200).json({
        status : "success",
        data : {
            data : distances
        }
    })
})