const fs = require('fs')
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))      

// params middleware inte vere version (checking whether the id is valid or not)
exports.checkId = (req, res, next, val) =>{
    if(req.params.id*1 > tours.length){
        return res.status(404).json({
            status : "fail",
            message : "invalid Id"
        })
    }
    next()
}

// middleware for checking the name and the price is present or not 
exports.checkBody = (req, res, next) =>{
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status : "fail",
            message : "Missing price or name!"
        })
    }
    next()
}

// GET ALL TOURS 
exports.getAllTours = (req, res)=>{
    res.status(200).json({
        status : 'success',
        requestedAt : req.requestTime,
        results : tours.length,
        data : {
            tours
        }
    })
}

// GET SPECIFIED TOUR 
exports.getTour = (req, res)=>{
    
    const id = Number(req.params.id)
    const tour = tours.find(el=>el.id === id)

    res.status(200).json({
        status : "success",
        data : {
            tour
        }
    })
}
  
// CREATE TOUR 
exports.createTour = (req, res)=>{
    const newId = Number(tours[tours.length-1].id)+1
    const newTour = Object.assign({id : newId}, req.body)

    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err=>{
        res.status(201).json({
            status : 'success',
            data : {
                tour : newTour
            }
        })
    })
}

// UPDATE TOUR 
exports.updateTour = (req, res)=>{

    res.status(200).json({
        status : "success",
        data : "updated tour here!"
    })
}

// DELETE TOUR 
exports.deleteTour = (req, res)=>{

    res.status(204).json({
        status : "success",
        data : null 
    })
}