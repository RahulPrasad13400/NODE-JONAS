const express = require("express")
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
// const reviewController = require("./../controllers/reviewController")
const reviewRouter = require("./../routes/reviewRoutes")

const router = express.Router()

// param middleware 
// router.param('id', (req, res, next, val)=>{
//     console.log(val)
//     next()
// })

// router.param('id', tourController.checkId)

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
// theses are the two way you can do it
// 1. /tours-within?distance=23&center=45,32&unit=mi
// 2. /tours-within/234/center/45,32/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)   
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour) 

//  POST /tour/123/reviews/ 
//  GET  /tour/123/reviews/
//  GET  /tour/123/reviews/12

// router.route('/:tourId/reviews')
    // .post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

router.use('/:tourId/reviews', reviewRouter)

module.exports = router