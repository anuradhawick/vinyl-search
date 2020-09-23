/**
 * Created by anuradhawick on 23/9/20.
 */

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

let atlas_connection_uri = null;
let cachedDb = null;

connect_db = async () => {
  var uri = 'mongodb://localhost:27017';

  if (atlas_connection_uri === null) {
    atlas_connection_uri = uri;
  }

  try {
    //testing if the database connection exists and is connected to Atlas so we can try to re-use it
    if (cachedDb && cachedDb.serverConfig.isConnected()) {
      return cachedDb
    }
    else {
      const client = await MongoClient.connect(atlas_connection_uri, {useNewUrlParser: true});
      cachedDb = client.db('vinyl');
      return cachedDb;
    }
  } catch (err) {
    console.error('an error occurred', err);
    throw new Error();
  }
};

runner = async () => {
  const db = await connect_db();
  const data = await db.collection('selling_items').aggregate([]).toArray();

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    await db.collection('selling_items').updateOne({_id: ObjectID(d._id)}, {"$set": { "updatedAt": new Date(d.updatedAt) }})
  }

  console.log("DONE")
};

runner();
