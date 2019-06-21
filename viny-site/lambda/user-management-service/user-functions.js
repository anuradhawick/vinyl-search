const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const S3 = require('aws-sdk').S3;

const s3 = new S3();

const update_user = async (uid, userdata) => {
  const db = await db_util.connect_db();

  const set_user = {
    $set: {
      updatedAt: new Date()
    }
  };

  if (!_.isEmpty(userdata.picture)) {
    _.assign(set_user.$set, {
      picture: userdata.picture
    });
  }

  if (!_.isEmpty(userdata.family_name) && !_.isEmpty(userdata.given_name)) {
    _.assign(set_user.$set, {
      family_name: userdata.family_name,
      given_name: userdata.given_name,
      name: userdata.given_name + " " + userdata.family_name,
    });
  }

  if (_.isEmpty(userdata.family_name) && _.isEmpty(userdata.given_name) && _.isEmpty(userdata.picture)) {
    return null;
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
            $sort: {
              createdAt: -1
            }
          },
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
              catalogNo: 1,
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
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $addFields: {
              id: "$_id"
            }
          },
          {
            $project: {
              postTitle: 1,
              createdAt: 1,
              id: 1
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

  const db = await db_util.connect_db();
  const records = await db.collection('records').find({id: ObjectID(recordId)}).toArray();

  let images = [];

  _.each(records, (record) => {
    images = _.uniq(_.concat(images, record.images));
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    const list = _.split(image, '/');
    const filename = list.pop();
    const pathname = list.pop();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `records-images/${filename}`
    };

    if (pathname !== 'records-images') {
      return true;
    }

    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
          if (err) {
            resolve();
          }
          else {
            resolve()
          }
        }
      );
    });
  }));

  const removeRecord = db.collection('records').remove({
    id: ObjectID(recordId),
    ownerUid: uid
  });

  await Promise.all([removeRecord, removeImages]);

  return true;
};

module.exports = {
  update_user,
  get_user,
  get_user_records,
  get_user_forum_posts,
  delete_record
};
