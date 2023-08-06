import express from 'express'
import mongoose from 'mongoose';
import Order from '../models/order.js'
import Product from '../models/product.js'
import product from '../models/product.js';
const router = express.Router();

router.get('/',(req,res) =>{
    Order.find()
    .select('product quantity _id')
    .exec()
    .then(docs =>{
        res.status(200).json({
            count:docs.length,
            orders:docs.map(doc =>{
                return {
                    _id: doc._id,
                    product:doc.product,
                    quantity:doc.quantity,
                    request:{
                        type:'GET',
                        url:'http://localhost:5000/orders/' +doc._id
                    }
                }
            })
        })
    })
    .catch(err =>{
        res.status(500).json({
            error:err
        })
    })
})

router.post('/',(req,res) =>{
    // const order = {
    //     productId:req.body.productId,
    //     quantity:req.body.quantity
    // };
    Product.findById(req.body.id)
    .then(product => {
        if(!product){
            return res.status(404).json({
                message:'Product not found'
            })
        }
        const order = new Order({
            _id:new mongoose.Types.ObjectId(),
            quantity:req.body.quantity,
            product:req.body.id
        })
        return order
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message:'Order stored',
                createdOrder:{
                    _id:result._id,
                    product:result.product,
                    quantity:result.quantity
                },
                request:{
                    type:'GET',
                    url:'http://localhost:5000/orders/' +result._id
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            })
        })
    })
})
    
    // res.status(201 ).json({
    //     message:"Order was created",
    //     order:order
    // })

router.get('/:orderId',(req,res) =>{
    Order.findById(req.params.orderId)
    .exec()
    .then(order =>{
        if(!order){
            return res.status(404).json({
                message:'Order not found'
            })
        }
        res.status(200).json({
            order:order,
            request:{
                type:'GET',
                url:'http://localhost:5000/orders'
            }
        })
    })
    .catch(err =>{
        res.status(500).json({
            error:err
        })
    })
    // res.status(200).json({
    //     message:"Orders details",
    //     orderId:req.params.orderId
    // })
})

router.delete('/:orderId',(req,res) =>{
    Order.removeOne({_id:req.params.orderId})
    .exec()
    .then(result =>{
        res.status(200).json({
            message:'Order deleted',
            request:{
                type:"POST",
                url:"http://localhost:5000/orders",
                body:{ id:"ID", quantity:"Number"}
            }
        })
    })
    .catch(err =>{
        res.status(500).json({
            error:err
        })
    })
})

export default router