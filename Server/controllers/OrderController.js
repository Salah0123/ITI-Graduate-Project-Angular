const Order = require("../models/OrderSchema");
const mongoose = require("mongoose");


exports.addOrder = (req, res, next) => {
  // console.log(req.decodedObject);
  // console.log(req.body.product[0].product)
  // for (let i =0; i<req.body.product.length; i++ ){
  //   Product.findOne({ _id: req.body.product[i].product})
  //   .then(doc=>{
  //     console.log(doc)
  //     next()
  //   })
  //   .catch(err=>{
  //     console.log("1111")
  //     next(err)})
  // }
  const newOrder = new Order({
    user: req.decodedObject.id,
    product: req.body.product,
    quantity: req.body.quantity,
  });

  newOrder
    .save()
    .then((doc) => {
      res.status(200).json({ message: doc });
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
};

exports.getAllOrders = (req, res, next) => {
  Order.find()
    .populate("user", "userName email")
    .populate("product.product", "name price image")
    .sort({ createdAt: -1 })
    .then((doc) => {
      if (doc.length >= 1) {
        res.status(200).json({ message: doc });
      } else {
        res.status(404).json({ message: "Order Is Not Found" });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.updateOrder = (req, res, next) => {
  const newProduct = req.body.product;
  
  Order.find({ _id: req.params.id })
  .then((doc) => {
    let isAdded=false;
        var oldProduct = doc[0].product;
        // console.log(oldProduct);
      // for (let indxOfNewPrd = 0;indxOfNewPrd < newProduct.length;indxOfNewPrd++) {
        for ( let indxOfOldPrd = 0;indxOfOldPrd < oldProduct.length; indxOfOldPrd++) {
          if (
            newProduct[0].product == oldProduct[indxOfOldPrd].product.toString()
            ) {
            oldProduct[indxOfOldPrd].quantity += newProduct[0].quantity;
            console.log(newProduct);
            isAdded=true
            // newProduct.splice(0, 1);
            console.log(newProduct);
            // break;
          }
        // }
      }
      if (!isAdded) {
        oldProduct = oldProduct.concat(newProduct);
      }

      // console.log(newProduct);
      // console.log(oldProduct);
      const newOrder = {
        product: oldProduct,
      };
      Order.findOneAndUpdate({ _id: req.params.id }, { $set: newOrder })
        .then((doc) => {
          if (doc.product.length >= 1) {
            res.status(200).json({ doc });
          } else {
            res.status(404).json({ message: "Order Not Found" });
          }
        })
        .catch((err) => {
          res.status(403).json({ message: err });
        });
    })
    .catch((err) => {
      res.status(404).json({ message: err,mes:"555" });
    });
};

exports.changeOrderStatus = (req,res,next)=>{
  const newObj = {
    status: req.body.status
  }
  const id = req.params.id;
  Order.findOneAndUpdate({_id:id},{$set:newObj})
  .then((doc)=>{
    if(doc){
      res.status(200).json({doc})
    }else {
      res.status(404).json({message: "Order Is Not Found"})
    }
  })
  .catch(err=>next(err))
}

exports.getOrderByStatus=(req,res,next)=>{
  const orderStatus = req.query.orderStatus;
  Order.find({ status: orderStatus })
    .populate("user", "userName email")
    .populate("product.product", "name price image")
    .sort({ createdAt: -1 })
    .then((doc) => {
      if (doc.length > 0) {
        res.status(200).json({ doc });
      } else {
        res.status(404).json({ message: "Not Found Orders" });
      }
    })
    .catch((err) => next(err));
}

exports.updateFullOrder=(req,res,next)=>{
  // const newProduct = req.body.product;
  const newProduct = {
    product: req.body.product,
  };

  Order.findOneAndUpdate({ _id: req.params.id }, { $set: newProduct })
    .then((doc) => {
      if (doc.product.length >= 1) {
        res.status(200).json({ doc });
      } else {
        res.status(404).json({ message: "Order Not Found" });
      }
    })
    .catch((err) => {
      res.status(403).json({ message: err });
    });
}

exports.deleteOrder = (req,res,next)=>{
    Order.findOneAndDelete({ _id: req.params.id })
      .then(result=>{
        if(result){
            res.status(200).json({message:"Order Is Deleted Successfully"})
        }else{
            res.status(404).json({message: "Order Is Not Found"})
        }
      })
      .catch((err) => {
        res.status(404).json({ message: err });
      });
}

exports.orderByID=(req,res,next)=>{
    Order.find({ _id: req.params.id })
      .populate("user", "userName email")
      .populate("product.product", "name price image size color quantity")
      .then((doc) => {
        // console.log(doc);
        if (doc.length >= 1) {
          res.status(200).json({ doc });
        } else {
          res.status(404).json({ message: "Order Not Found" });
        }
      })
      .catch((err) => {
        res.status(404).json({ message: err });
      });
}

exports.userOrders=(req,res,next)=>{
  const userId = req.decodedObject.id;
  // console.log(req.decodedObject.id);
  Order.find({ user: userId })
    .populate('product.product')
    .populate("user", "userName")
    .then((doc) => {
      if (doc.length >= 1) {
        res.status(200).json({ doc });
      } else {
        const error = new Error("No Order Found");
        next(error);
      }
    })
    .catch((error) => next(error));
}

// exports.getUserOrderByAdmin = (req, res, next) => {
//   // const { email } = req.query;
//   const id = req.params.id;
//   Order.find({ user: id })
//     .then((doc) => {
//       if (doc.length > 0) {
//         res.status(200).json({ doc });
//       } else {
//         res.status(404).json({ message: "Not Found Order" });
//       }
//     })
//     .catch((err) => next(err));
// };
