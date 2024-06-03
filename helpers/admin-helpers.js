const db = require("../config/connection");
const collection = require("../config/collections");
var ObjectId = require("mongodb").ObjectId;

module.exports = {
    doLogin: function(adminData) {
        return new Promise(async function(resolve, reject) {
            let loginStatus = false;
            let response = {};
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.Email })
            if (admin) {
                if (admin.password === adminData.Password) {
                    console.log("Login Success");
                    response.admin = admin;
                    response.status = true;
                    console.log("Response contains: " + response);
                    resolve(response)
                } else {
                    console.log("Login Failed: Incorrect Password");
                    resolve({ status: false })
                }
            } else {
                console.log("Login Failed: User does not exist");
                resolve({ status: false })
            }
        })
    },
    
    getAllOrders: function(user) {
        return new Promise(async(resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
            resolve(orders)
        })
    },
    getAllUsers: function(user) {
        return new Promise(async(resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
            resolve(users)
        })
    },
    getUserById: function(userId) {
        return new Promise(async(resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id:new ObjectId(userId) });
            resolve(user);
        });
    },
    
}
