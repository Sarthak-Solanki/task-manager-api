const express = require('express')
 require('./db/mongoose')
 const User  = require('./models/user')
 const Task =require('./models/task') 
 const userRouter = require('./router/user')
const taskRouter = require('./router/task')
const app  = express()
const port  =   process.env.PORT 
// app.use((req,res,next)=>{
//     if(req.method==='GET'){
//         res.send("GET req are disable")
//     }
//     else{
//         next()
//     }
// })

const multer = require('multer')
const upload = multer({
    dest:'images'
})

app.post('/upload',upload.single('upload'),async(req,res)=>{
     res.send()
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port,()=>{
    console.log('Server is up on port ' +port);
    
})
const jwt = require('jsonwebtoken')
const myFun = async()=>{
   const user = await User.findById('5d9b47e95dbf52d88ff3adfb')
   await user.populate('tasks').execPopulate()
  // console.log(user.tasks);
   
}
//myFun()