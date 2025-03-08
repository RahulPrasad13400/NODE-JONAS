const Tour = require('../models/tourModel')

exports.getAllTours = async (req, res)=>{
    // req.query to get the queries from the url 
    try{
        // const tours = await Tour.find() // find is used to get all tours 
        
        // const tours = await Tour.find({  // filtering 
        //     duration : 5,
        //     difficulty : 'easy'
        // })

        // DIFFERENT SYNTAX SAME PURPOSE 
        // const tours = await Tour.find().where('duration').equals(5)
        // .where('difficulty').equals('easy')

        // const tours = await Tour.find(req.query)

        // database il ilatha variables vanna query handle cheyan vendi 
        const queryObj = {...req.query}
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach((el)=> delete queryObj[el]) // deleting those fields from query 

        // const tours = await Tour.find(queryObj)

        // const query = Tour.find(queryObj)
        // const tours = await query

        // ADVANCED FILTERING 
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // gte , lte.. ithinte ellam munbil $ sign add cheyyan vendi ane 

        let query = Tour.find(JSON.parse(queryStr))

        // SORTING 
        // if(req.query.sort){
        //     query = query.sort(req.query.sort)
        // }

        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        }else{
            // if the url dosent contain a sort, we sort it based on the created At field 
            query = query.sort('-createdAt')
        }

        // Field Limiting
        if(req.query.fields){
            // select('name duration price')
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        }else{
            // adding default field 
            query = query.select("-__v")
        }

        // PAGINATION
            const page = req.query.page*1 || 1
            const limit = req.query.limit*1 || 3
            const skip =  (page - 1)*limit

            query = query.skip(skip).limit(limit)

            if(req.query.page){
                const numTours = await Tour.countDocuments()
                if(skip>=numTours){
                    throw new Error("This page dosen't exist!")
                }
            }

        // EXECUTE QUERY 
        const tours = await query
        
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
        const tour = await Tour.findByIdAndUpdate(id, req.body, {new : true}) // update aya data return cheyyan vendi ane 3rd argument (new : true) kodukunath
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