const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const config = require("./config.js");

const uri = config.DB_CONNECTION_URL;
const mongoClient = new MongoClient(uri, {useUnifiedTopology: true});

// Private Variables
db = null;

// Establish connection to a MongoDB database server.
const connect = async () => {  
  try {
    // mongoClient and client point to the same place in memory, which means that once this function is over, we still have access to the client object via mongoClient. We can for example use it to disconnect the connection or errors.
    const client = await mongoClient.connect();

    // gets a database instance by name "facebook" even if it does not exist (really mongodb?). If the database instance exists, you can run queries, if it does not, then mongodb will create it once you run a query.
    db = await client.db("login_system_v1");
    return Promise.resolve();
  } catch (error) {
    if (mongoClient.isConnected) {
      await mongoClient.close();
    }
    // set the db variable to null in case something was saved, so the garbage collector can free it.
    db = null;
    return Promise.reject(error);
  }
}

const disconnect = async () => {
  if (mongoClient.isConnected) {
    await mongoClient.close();
    return Promise.resolve();
  } else {
    return Promise.reject("ERROR: MongoClient was not connected");
  }
}


/**
 * Returns a database instance
 * @see: {@link https://mongodb.github.io/node-mongodb-native/3.1/api/Db.html}
 */
const getDb = async () => {
  return new Promise((resolve, reject) => {
    if (mongoClient.isConnected && db != null) {
      resolve(db);
    } else {
      reject("ERROR: There is no database instance");
    }
  });
}

module.exports = {
  connect: connect,
  disconnect: disconnect,
  getDb: getDb
}