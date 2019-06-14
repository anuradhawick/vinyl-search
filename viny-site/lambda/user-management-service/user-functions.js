const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;

const update_user = async (uid, userdata) => {
  const db = await db_util.connect_db();

  const set_user = {
    $set: {
      family_name: userdata.family_name,
      given_name: userdata.given_name,
      name: userdata.given_name + " "+ userdata.family_name,
      updatedAt: new Date()
    }
  };

  if (!_.isEmpty(userdata.picture)) {
    _.assign(set_user.$set, {
      picture: userdata.picture
    });
  }

  const newUserData = await db.collection('users').findOneAndUpdate({uid: uid},
    set_user,
    {
      returnOriginal: false,
      upsert: false
    });

  return newUserData;
};


const get_user = async (uid) => {
  const db = await db_util.connect_db();

  return await db.collection('users').findOne({uid: uid});
};


const get_user_records = async (uid, query_params) => {

  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await db_util.connect_db();

  const data = await db.collection('records').aggregate([
    {
      $match: {
        ownerUid: uid,
        latest: true
      }
    },
    {
      $facet: {
        data: [{$count: "total"}],
        records: [
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $project: {
              name: 1,
              label: 1,
              genres: 1,
              chosenImage: 1,
              images: 1,
              id: 1,
              score: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {count: {$arrayElemAt: ["$data", 0]}}
    },
    {
      $addFields: {
        count: "$count.total",
        limit: limit,
        skip: skip
      }
    },
    {
      $project: {
        data: 0
      }
    }
  ]).toArray();

  return data[0];

};


const get_user_forum_posts = async (uid, query_params) => {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await db_util.connect_db();

  const data = await db.collection('forum_posts').aggregate([
    {
      $match: {
        ownerUid: uid
      }
    },
    {
      $facet: {
        data: [{$count: "total"}],
        posts: [
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $project: {
              postTitle: 1,
              _id: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {count: {$arrayElemAt: ["$data", 0]}}
    },
    {
      $addFields: {
        count: "$count.total",
        limit: limit,
        skip: skip
      }
    },
    {
      $project: {
        data: 0
      }
    }
  ]).toArray();

  return data[0];

};


const delete_record = async (uid, recordId) => {

  recordId = "5cf8ee10f780eb0007a686c9"

  const db = await db_util.connect_db();
  // const record = await db.collection('records').findOne({_id: ObjectID(recordId)});

  let query = {
    // ensure only the owner or an admin can delete
    id: ObjectID(recordId)
    // ownerUid: uid
  };

  const removeRecord = db.collection('records').remove(query);

  await Promise.all([removeRecord]);

  return true;
};

module.exports = {
  update_user,
  get_user,
  get_user_records,
  get_user_forum_posts,
  delete_record
};
