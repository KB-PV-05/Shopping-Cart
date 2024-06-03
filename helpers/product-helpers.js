var db = require('../config/connection');
var collection = require('../config/collections');
var ObjectId = require("mongodb").ObjectId;

module.exports = {
    addProduct: (product, callback) => {
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
            callback(data.insertedId);
        });
    },
    getAllProducts: () => {
        return new Promise(async(resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    },
    deleteProduct: (prodId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: new ObjectId(prodId) }).then(() => {
                resolve();
            });
        });
    },
    getProductDetails: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: new ObjectId(proId) }).then((product) => {
                resolve(product);
            });
        });
    },
    updateProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: new ObjectId(proId) }, {
                $set: {
                    Name: proDetails.Name,
                    Description: proDetails.Description,
                    Category: proDetails.Category,
                    Price: proDetails.Price,
                }
            }).then(() => {
                resolve();
            });
        });
    },
    getUserOrders: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).find({ userId: userId }).toArray().then((orders) => {
                resolve(orders);
            });
        });
    },
    getAllOrders: () => {
        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray();
            resolve(orders);
        });
    },
};
