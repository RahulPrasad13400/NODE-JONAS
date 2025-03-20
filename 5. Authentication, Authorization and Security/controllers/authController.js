const {promisify} = require('util')
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const jwt = require("jsonwebtoken")
const AppError = require("./../utils/appError")
const sendEmail = require("./../utils/email")

const signToken = id =>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRES_IN})
}

const createSendToken = (user, statusCode, res) => {

    const token = signToken(user._id)

    const cookieOptions = {
        expires : new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly : true
    }

    if(process.env.NODE_ENV === "production") cookieOptions.secure = true

    res.cookie("jwt", token, cookieOptions )

    // To remove the password from the response 
    user.password = undefined

    res.status(statusCode).json({
        status : "success",
        token,
        data : {
            user
        }
    }) 
}

exports.signup = catchAsync( async (req, res, next) =>{
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        role  : req.body.role 
    })

    // const token = jwt.sign({id : newUser._id}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRES_IN})
    // const token = signToken(newUser._id)

    // res.status(201).json({
    //     status : "success",
    //     token,
    //     data : {
    //         user : newUser
    //     }
    // })

    createSendToken(newUser, 201, res)

})

exports.login = catchAsync( async (req, res, next) =>{
    const {email, password} = req.body 

    if(!email || !password){
        return next(new AppError("Please provide email and password", 400))
    }

    const user = await User.findOne({email}).select("+password") 
    // const correct = await user.correctPassword(password, user.password)

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError("Incorrect email or password!", 401))
    }

    // const token = await jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn : process.env.JWT_EXPIRES_IN})

    // const token = signToken(user._id )

    // res.status(200).json({
    //     status : "success",
    //     token,
    //     data : {
    //         user 
    //     }
    // })

    createSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next)=>{
    
    // 1. GETTING TOKEN AND CHECK OF IT'S THERE 
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    
    if(!token){
        return next(new AppError("You are not logged in!", 401))
    }

    
    
    // 2. VERIFICATION TOKEN
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    
    
    // 3. CHECK IF USER STILL EXISTS 
    const freshUser = await User.findById(decoded.id)
    if(!freshUser){
        return next(new AppError(`The user belonging to this token doesn't exist`, 401))
    }

    // 4. CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED 
    // console.log(await freshUser.changedPasswordAfter(decoded.iat))
    if(await freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError(`User recently changed the password. Please login again.`, 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE 
    req.user = freshUser
    next()
})

exports.restrictTo = (...roles) => {
    // roles - ['admin', 'lead-guide']
    return (req, res, next) =>{
        if(!roles.includes(req.user.role)){
            return next(new AppError("You do not have permission to perform this action", 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync( async (req, res, next) => {

    // 1) GET USER BASED ON POSTED EMAIL
    const user = await User.findOne({email : req.body.email})
    if(!user){
        return next(new AppError("No user found with this email!", 404))
    }

    // 2) GENERATE THE RANDOM RESET TOKEN 
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave : false})   // IMPORTANT (it deactivates all the validators in User Schema)

    // 3) SEND IT TO THE USER EMAIL 
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    const message = `Forgot Your Password? Submit a Patch with a new Password and password confirm to: ${resetURL}`

    try {

        await sendEmail({
            email : user.email,
            subject : `Your password reset token (valid for 10 min)`,
            message
        })
    
        res.status(200).json({
            status : "success",
            message : "Token sent to email"
        })

    } catch (error) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave : false})

        return next(new AppError("There was an error sending the email. Try again later!"))
    }

})

exports.resetPassword = catchAsync( async (req, res, next) => {  
    
    // 1) Get the user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({passwordResetToken : hashedToken, passwordResetExpires : {$gt : Date.now()}})

    // 2) If the token has not expired and there is a User, set the new Password 
    if(!user){
        return next(new AppError("Token is invalid or has expired!", 400))
    }
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    // 3) Update changed passwordAt property for the user 
    // 4) Log the user in, send the jwt  
    // const token = signToken(user._id)
    // res.status(200).json({
    //     status : "success",
    //     token  
    // })

    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync( async (req, res, next) => {
    // 1) Get the user from the collection 
    const user = await User.findById(req.user.id).select('+password')
    // 2) Check if the posted current password is correct  
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next (new AppError("Your current password is wrong", 401))
    }

    // 3) If so, update the password 
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()

    // 4) Log user in, send jwt 
    createSendToken(user, 200, res)

})