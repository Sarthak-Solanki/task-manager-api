const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')

const sharp = require('sharp')

router.post('/users', async(req,res)=>{
    //console.log(req.body);
    const user = new User(req.body)
    try{
        await user.save()

    const token  = await user.generateAuthToken()
        res.status(201).send({user,token})
    }
    catch (e){
        res.status(400).send(user)

    }
})

router.post('/users/login',async(req,res)=>{
    try {
        //console.log(req.body.email);
       // console.log(req.body.password);
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})
router.post('/users/logoutAll',auth,async(req,res)=>{
    try {

        req.user.tokens = [] 
        // req.user.tokens = req.user.tokens.filter((token)=>{
        //     return false;
        // })
        await req.user.save()
        res.status(200).send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth,async(req,res)=>{
    res.send(req.user); 
})


router.delete('/users/me',auth,async(req,res)=>{
    console.log(req.params.id);
    
    try {
        await req.user.remove()
        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/users/me',auth,async(req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name','email','password','age']
    console.log(updates);
    console.log(req.body[updates]);
    
    
    const isValid = updates.every((update)=>{
        return allowedUpdate.includes(update)
    })
    if(!isValid){
        
        return res.status(400).send({error:'Invalid updates'})
    }
    try {
        const user = await req.user//await User.findById(req.params.id)
        updates.forEach((update)=>user[update] = req.body[update])
        await user.save()
        //const user  = await User.findByIdAndUpdate(req.params.id, req.body,{new:true,runValidators:true})
    //    if(!user){
    //    res.status(404).send()
    //   }
   res.status(200).send(user)
    } catch (error) {
         res.status(400).send()
    }
})

const upload = multer({
    //dest:'avatars',
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('please upload image'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'), async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send(req.user)
},(error,req,res,next)=>{
res.status(400).send(error.message)
})

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if(!user|| !user.avatar){
            return new Error()
        }
        res.set('Content-Type','images/png')
        res.status(200).send(user.avatar )
    } catch (error) {
        res.status(400).send()
    }
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    try {
         req.user.avatar = undefined
         await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})






module.exports = router