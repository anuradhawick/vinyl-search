import { MongoClient } from 'mongodb';

const atlas_connection_uri = process.env['MONGODB_ATLAS_CLUSTER_URI'];;
let cachedDb = null;
let client = null;


export async function connect_db() {
  try {
    //testing if the database connection exists and is connected to Atlas so we can try to re-use it
    if (cachedDb) {
      return cachedDb
    }
    else {
      client = await MongoClient.connect(atlas_connection_uri, { useNewUrlParser: true });
      cachedDb = await client.db('vinyl');
      return cachedDb;
    }
  } catch (err) {
    console.error('an error occurred', err);
    throw new Error();
  }
};
