const MongoClient = require("mongodb").MongoClient;

const state = {
  db: null,
};

module.exports.connect = async function (done) {
  const url =
    "mongodb+srv://KBPV:ParvathyKVidhyaB@cluster0.aythefx.mongodb.net/ShoppingCart";
  const dbName = "shopping";

  try {
    const client = await MongoClient.connect(url);
    state.db = client.db(dbName);
    done();
  } catch (err) {
    done(err);
  }
};

module.exports.get = function () {
  return state.db;
};
