import express from "express"
import Product from '../models/product.js'
import mongoose from "mongoose";
import multer from "multer";
const router = express.Router();

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/')
    },
    filename:function(req,file,cb){
        cb(null, new Date().toISOString().replace(/:/g,'-') + file.originalname)
    }
})

const fileFilter = (req,file,cb) =>{
    //reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype=== 'image/png'){
        cb(null,true);
    } else{
        cb(null,false);
    }
}

const upload = multer({
    storage:storage,
    limits: {
    fileSize: 1024*1024 * 5
},
fileFilter:fileFilter
})


router.get('/',(req,res)=>{
    Product.find()
    .exec()
    .then(docs =>{
        res.status(200).json(docs)
    })
    .catch(err =>{
        res.status(500).json({
            error:err
        })
    })
})

router.post('/',upload.single('productImage'),(req,res)=>{
    console.log(req.file)
    // const product = {
    //     name:req.body.name,
    //     price:req.body.price
    // };
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage: req.file.path
    });

    product
    .save()
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message:"Created product successfully",
            createdProduct :{
                name:result.name,
                price:result.price,
                _id:result._id,
                request:{
                    type:'GET',
                    url:"http://localhost:5000/products/" + result._id
                }
            }
        })
    }).catch(err => {
        console.log(err)
        res.status(500).json({
            error:err
        })
    });
})

router.get('/:id',(req,res)=>{
    const id = req.params.id
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc =>{
        console.log("From database",doc);
        if(doc){
            res.status(200).json({
                product:doc,
                request:{
                    type:'GET',
                    url:'http://localhost:5000/products'
                }
            })
        } else{
            res.status(404).json({message:"No valid entry found for provided ID"})
        }
    })
    .catch(err =>{
        console.log(err)
        res.status(500).json({error:err});
    })
})

router.patch('/:id',(req,res)=>{
    const id = req.params.id;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value
    }
    Product.updateOne({_id:id}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message:'Product updated',
            request:{
                type:'GET',
                url:'http://localhost:5000/products/' + id
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
})

router.delete('/:id',(req,res)=>{
    const id = req.params.id
    Product.deleteOne({_id:id})
    .exec()
    .then(result => {
        res.status(200).json(result)
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
})


export default router