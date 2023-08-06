import express from "express"
import bodyParser from "body-parser"
import productRoutes from './api/routes/products.js'
import orderRoutes from './api/routes/orders.js'
import morgan from "morgan"
import mongoose from "mongoose"

const app = express();

mongoose.connect('mongodb+srv://user1:' + 
process.env.MONGO_ATLAS_PW +
'@cluster0.ptcvcud.mongodb.net/?retryWrites=true&w=majority')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(morgan('dev'))

//handling CORS errors
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Header','Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next();
})

app.use('/products',productRoutes)
app.use('/orders',orderRoutes)

app.use((req,res,next) =>{
    const error = new Error('Not found')
    error.status(404)
    next(error)
})

app.use((error,req,res,next) =>{
    res.status(error.status || 500)
    res.json({
        error:{
            message:error.message
        }
    })
})

const PORT = process.env.PORT || 5000


app.listen(PORT,()=>{
    console.log(`Server is up and running on ${PORT}`)
})