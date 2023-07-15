const express=require('express');
const router=express.Router();
const Controller= require("./../controllers/OrderController")
const authMW = require("./../MiddleWare/authenicatedMW");



router.post("/addOrder", authMW, Controller.addOrder)

router.get("/", authMW,Controller.getAllOrders)

router.get("/orderStatus", authMW, Controller.getOrderByStatus);

// router.get("/getUserOrderByAdmin/:id", authMW, Controller.getUserOrderByAdmin);

router.patch("/updateOrder/:id", authMW,Controller.updateOrder)

router.patch("/updateFullOrder/:id", authMW, Controller.updateFullOrder);

router.patch("/changeOrderStatus/:id", authMW, Controller.changeOrderStatus);

router.delete('/deleteOrder/:id', authMW,Controller.deleteOrder)

router.get("/:id", authMW, Controller.orderByID)

router.get("/user/orders", authMW, Controller.userOrders)






module.exports=router;