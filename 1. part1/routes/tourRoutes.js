const express = require("express")
const tourController = require('../controllers/tourController')

const router = express.Router()

// param middleware 
// router.param('id', (req, res, next, val)=>{
//     console.log(val)
//     next()
// })

router.param('id', tourController.checkId)

router.route('/').get(tourController.getAllTours).post(tourController.checkBody,tourController.createTour)
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour) 

module.exports = router