const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures')

// utils folder ilott move cheyuthu 
// class APIFeatures{
//     constructor(query, queryString){
//         this.query = query
//         this.queryString = queryString
//     }
//     filter(){
//         console.log(this.query)
//         const queryObj = {...this.queryString}
//         const excludedFields = ['page', 'sort', 'limit', 'fields']
//         excludedFields.forEach((el)=> delete queryObj[el])
        
//         let queryStr = JSON.stringify(queryObj)
//         queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

//         this.query = this.query.find(JSON.parse(queryStr))

//         return this // return this simply return this object 
//     }
//     sort(){
//         if(this.queryString.sort){
//             const sortBy = this.queryString.sort.split(',').join(' ')
//             this.query = this.query.sort(sortBy)
//         }else{
//             // if the url dosent contain a sort, we sort it based on the created At field 
//             this.query = this.query.sort('-createdAt')
//         }

//         return this // return this simply return this object 
//     }
//     limitFields(){
//         if(this.queryString.fields){
//             // select('name duration price')
//             const fields = this.queryString.fields.split(',').join(' ')
//             this.query = this.query.select(fields)
//         }else{
//             // adding default field 
//             this.query = this.query.select("-__v")
//         }
//         return this
//     }
//     paginate(){
//         const page = this.queryString.page*1 || 1
//         const limit = this.queryString.limit*1 || 10
//         const skip =  (page - 1)*limit

//         this.query = this.query.skip(skip).limit(limit)

//         return this
//     }
// }

exports.getAllTours = async (req, res)=>{
    
    try{

        // EXECUTE QUERY 
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
        const tours = await features.query
        
        res.status(200).json({
            status : "success",
            results : tours.length,
            data : {
                tours
            }
        })
    }catch(error){
        console.log("Something went wrong in the getAllTours controller", error.message)
        res.status(400).json({
            status  : "fail",
            message : error.message
        })
    }
}

exports.getTour = async (req, res)=>{
    const {id} = req.params
    try{
        const tour = await Tour.findById(id)
        res.status(200).json({
            status : "success",
            data : {
                tour
            }
        })
    }catch(error){
        console.log("Something went wrong in the getTour controller", error.message)
        res.status(400).json({
            status  : "fail",
            message : error.message
        })        
    }
}
  
exports.createTour = async (req, res)=>{
    // const {name, rating, price} = req.body
    try{
        // const newTour = new Tour({})
        // newTour.save()
        
        // const newTour = await Tour.create({
        //     name, 
        //     rating,
        //     price
        // })

        const newTour = await Tour.create(req.body)

        res.status(200).json({
            status : "success",
            data : {
                tour : newTour
            }
        })

    } catch(error){
        console.log("Something went wrong in the createTour ", error.message)
        res.status(400).json({
            status : "fail",
            message : error.message
        })
    }
}

exports.updateTour = async (req, res)=>{
    const {id} = req.params
    try{
        // const tour = await Tour.findByIdAndUpdate(id, req.body)
        // const tour = await Tour.findByIdAndUpdate(id, req.body, {new : true}) // update aya data return cheyyan vendi ane 3rd argument (new : true) kodukunath
        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new : true,
            runValidators : true // it will check the tour model before running it 
        })
        res.status(200).json({
            status : "success",
            data : {
                tour
            }
        })
    }catch(error){
        console.log("Something went wrong in the updateTour ", error.message)
        res.status(400).json({
            status : "fail",
            message : error.message
        })
    }
}

exports.deleteTour = async (req, res)=>{
    const {id} = req.params
    try{
        await Tour.findByIdAndDelete(id)
        res.status(200).json({
            status : "success",
            data : null 
        })
    }catch(error){
        console.log("Something went wrong in the deleteTour ", error.message)
        res.status(400).json({
            status : "fail",
            message : error.message
        })       
    }
}

exports.aliasTopTours = async (req, res, next) =>{
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}  

exports.getTourStats = async (req, res) =>{
    try{
        const stats = await Tour.aggregate([
            {
                $match : {ratingsAverage : {$gte : 4.5} }   // it only gets the tours with the average of 4.5
            },
            {
                $group : {
                    // _id : null,     // group all the documents together 
                    // _id : '$difficulty',   // groups document based on difficulty 
                    _id : {$toUpper : '$difficulty'},   // difficulty ne uppercase ilott akkum (DIFFICULTY)
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
            // {
            //     $match : {
            //         _id : {$ne : "EASY"}
            //     }
            // }
        ])

        res.status(200).json({
            status : "success",
            data : {
                stats 
            }
        })

    }catch(error){
        console.log("Something went wrong in the getTourStats ", error.message)
        res.status(400).json({
            status : "fail",
            message : error.message
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {

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
                $sort : {numTourStarts : 1}   // -1 
            },
            {
                $limit : 12          // it limits the document to the given number 
            }
        ])

        res.status(200).json({
            status : "success",
            data : {
                plan 
            }
        })

    } catch (error) {
        console.log("Something went wrong in the getMonthlyPlan ", error.message)
        res.status(400).json({
            status : "fail",
            message : error.message
        })        
    }
}
