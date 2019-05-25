const MongoClient = require('mongodb').MongoClient;
const functions = require('firebase-functions');
const uri = functions.config().mongo.url;
const client = new MongoClient(uri, {useNewUrlParser: true});

let cachedDb = null;

const connect_db = async () => {
    try {
        //testing if the database connection exists and is connected to Atlas so we can try to re-use it
        if (cachedDb && cachedDb.serverConfig.isConnected()) {
            return cachedDb
        }
        else {
            const connection = await client.connect();
            cachedDb = connection.db('vinyl');
            return cachedDb;
        }
    } catch (err) {
        console.error('an error occurred', err);
        throw new Error();
    }
};

module.exports = {
    connect_db
};
