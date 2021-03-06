const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/');
  },
  filename: function(req, file, cb){
    cb(null,new Date().toISOString()+file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if(file.mimetype === 'image/jpeg' || file.mimetype ==='image/png'){
    cb(null, true);
  }
  else{
    cb(null, false);
  }
}
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

router.get('/', (req, res, next) => {
  Product.find()
  .exec()
  .then(docs => {
    console.log("All document are: \n" + docs);
    res.status(200).json(docs);
  })
  .catch(err => {
    res.status(500).json({error: err});
  });
});

router.post('/',checkAuth, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
    const product = new Product({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      price: req.body.price,
      productImage: req.file.path
    });
    product.save()
    .then(result =>{
      console.log(result)
      res.status(200).json({
          message: 'Handling post request /product',
          createProduct: product
      });
    })
    .catch(err =>{
      console.log(err)
      res.status(500).json({error: err});
    });

});


router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
  //  .exec()
    .then(doc => {
      console.log("From database: " + doc);
      if(doc)
        res.status(200).json(doc);
      else
        res.status(404).json({message: "No valid data formate in this id"});
    })
    .catch(err => {
      console.log(err);
      res.status(200).json({error: err});
    });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
      updateOps[ops.propName] = ops.value
    }
    Product.update({_id: id},{ $set: updateOps})
    .exec()
    .then(result=>{
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ error: err});
    });
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({_id: id})
    .exec()
    .then(result => {
      console.log("successfully deleted");
      res.status(200).json(result);
    })
    .catch(err => {
      console.log("error in delete");
      res.status(500).json({
        error: err
      })
    });
});

module.exports = router;
