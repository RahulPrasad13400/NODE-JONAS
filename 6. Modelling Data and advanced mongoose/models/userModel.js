const mongoose = require("mongoose")
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Please tell us your name"] 
    },
    email : {
        type : String,
        required : [true, "User must have a email"],
        unique : true,
        lowercase : true,  // its not a validator it just transform the email to a lower case
        validate : [validator.isEmail, "Enter a valid email"]
    },
    photo : String,
    role : {
        type : String,
        default : 'user',
        enum : ['user', 'guide', 'lead-guide', 'admin']
    },
    password : {
        type : String,
        required : [true, "Password is required"],
        minlength : 4,   // A password should have atleast 1 character 
        select : false // password hide cheyan 
    },
    passwordConfirm : {
        type : String,
        required : [true, "Please confirm your password"],
        validate : {
            // This only works on CREATE OR SAVE 
            validator : function(el){
                return el === this.password
            },
            message : 'Passwords are not the same!'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    active : {
        type : Boolean,
        default : true,
        select : false
    }
})

userSchema.pre('save', async function(next){
    // run this function if password was modified 
    if(!this.isModified('password')) return next()

    // Hash the password with cost of 12 
    this.password = await bcrypt.hash(this.password, 12)

    // Delete the password confirm field 
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next() // this.isNew means whether the doc is just created
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(/^find/, function(next){
    // this point to the current query
    this.find({active : {$ne : false}})
    next()
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    console.log(candidatePassword, userPassword)
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = async function(JWTTimestamp){
    if(this.passwordChangedAt){
        console.log(this.passwordChangedAt, JWTTimestamp)
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        return JWTTimestamp < changedTimestamp
    }
    // false means not changed  
    return false 
}  

userSchema.methods.createPasswordResetToken = function(){
    const resetToken =  crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10*60*1000
    return resetToken
}

const User = mongoose.model("User", userSchema)

module.exports = User