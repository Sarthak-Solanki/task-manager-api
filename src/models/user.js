const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require('../models/task')
const sharp = require('sharp')
const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required:true,
        trim:true
    },
    email:{
    type:String,
    unique:true,
    required:true,
    trim:true,
    lowercase:true,
    validate(value){
        if(!validator.isEmail(value)){
            throw Error("this is an invalid email")
        }
    }
    },
    age:{
        type:Number   ,
        default:0,
        validate(value){
            if(value<0){
                throw new Error("Age is invalid")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error("password contains 'password")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true,
        }
    }],
    avatar:{
        type:Buffer
    }
    },{
        timestamps:true
    }
    
    )
    userSchema.virtual('tasks',{
        ref:'Task',
        localField:'_id',
        foreignField:'owner'
    })
    userSchema.methods.generateAuthToken = async function(){
        const user = this;
        const token = jwt.sign({_id:user.id.toString()},process.env.JWT)
        user.tokens = user.tokens.concat({token})
        await user.save()
        return token;
    }


    userSchema.methods.toJSON =  function(){
        const user = this
        const userObject  = user.toObject()
        delete userObject.tokens
        delete userObject.password
        delete userObject.avatar 
        return userObject
    }
userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})//await User.findOne({email:email})
    if(!user){
        throw new Error("Unable to login")
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Unable to login")
    }
    return user;
}
    //hash the plain password before saving
    userSchema.pre('save',async function(next){
        const user = this
        if(user.isModified('password')){
            user.password = await bcrypt.hash(user.password,8 )
        }
        //console.log('just before saving');
        
        next()
    })
    //delete user and tasks
    userSchema.pre('remove',async function(next){
        const user = this
       await Task.deleteMany({owner:user._id})
    })

const User = mongoose.model('User',userSchema)
module.exports = User;
