const MongoClient = require('mongodb').MongoClient;
const functions = require('firebase-functions');
const uri = functions.config().mongo.url;
const client = new MongoClient(uri, {useNewUrlParser: true});

const connect_db = async () => {
    con = await client.connect();
    db = con.db('vinyl');
    return db;
};

module.exports = {
    connect_db
};