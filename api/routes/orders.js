const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Order.find()
    .populate('product')
    .select("_id quantity productId ")
    .exec()
    .then( docs =>{
      if(docs){
        res.status(200).json(docs);
      }
      else
        console.log('No order found');
    })
    .catch( err => {
      res.status(500).json({ error: err});
    });
});

router.post('/', (req, res, next) => {
    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      productId: req.body.productId,
      quantity: req.body.quantity
    });
    Product.findById(req.body.productId)
    .then(product =>{
      if(!product)
        return res.status(404).json({message: "product not found"});
      order.save()
      .then(result =>{
        res.status(200).json(result);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ error: err});
      });
    })
    .catch(err => {
      res.status(500).json({message: "id not found"});
    });
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.findById({_id: id})
    .exec()
    .then( doc =>{
      if(!doc)
        return res.status(404).json({ message: "order not fount"});
      res.status(200).json(doc);
    })
    .catch( err => {
      res.status(500).json({ error: err});
    });
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    Order.deleteOne({_id: id})
    .exec()
    .then( result => {
      console.log('successfully delete with id '+ result._id);
      res.status(200).json(result)
    })
    .catch(err => {
      console.log("error in delete");
      res.status(500).json({
        error: err
      })
    });
});

module.exports = router;
