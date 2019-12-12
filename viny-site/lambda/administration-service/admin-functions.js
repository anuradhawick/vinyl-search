const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const CognitoIdentityServiceProvider = require('aws-sdk').CognitoIdentityServiceProvider;
const S3 = require('aws-sdk').S3;
const cheerio = require('cheerio');
const path = require('path');

const s3 = new S3();

const get_user_by_uid = async (uid) => {
  const db = await db_util.connect_db();
  return await db.collection('users').findOne({uid: uid})
};

const get_admin_users = async () => {
  const db = await db_util.connect_db();
  return await db.collection('users').find({roles: "Admin"}).toArray();
};

const remove_admin = async (uid) => {
  const db = await db_util.connect_db();
  const cognito = new CognitoIdentityServiceProvider();
  const dbUser = await db.collection('users').findOne({uid});
  const cognitoUsers = (await cognito.listUsers({
    UserPoolId: process.env.user_pool_id,
    Filter: `email = "${dbUser.email}"`
  }).promise()).Users;

  if (_.isEmpty(cognitoUsers) || dbUser.email === 'anuradhawick@gmail.com') {
    return false;
  } else {
    const username = cognitoUsers[0].Username;

    await cognito.adminRemoveUserFromGroup({
      GroupName: 'Admin',
      UserPoolId: process.env.user_pool_id,
      Username: username
    }).promise();

    await db.collection('users').updateOne(
      {
        uid, roles: "Admin"
      },
      {
        $pull: {
          roles: "Admin"
        }
      }
    );
    return true;
  }
};

const add_admin = async (email) => {
  const db = await db_util.connect_db();
  const cognito = new CognitoIdentityServiceProvider();
  const cognitoUsers = (await cognito.listUsers({
    UserPoolId: process.env.user_pool_id,
    Filter: `email = "${email}"`
  }).promise()).Users;

  if (_.isEmpty(cognitoUsers)) {
    return false;
  } else {
    const username = cognitoUsers[0].Username;

    await cognito.adminAddUserToGroup({
      GroupName: 'Admin',
      UserPoolId: process.env.user_pool_id,
      Username: username
    }).promise();

    await db.collection('users').updateOne(
      {
        email
      },
      {
        $addToSet: {
          roles: "Admin"
        }
      }
    );

    return true;
  }
};

const get_all_records = async (query_params) => {
  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));
  const db = await db_util.connect_db();
  const data = await db.collection('records').aggregate([
    {
      $match: {
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

  const records = data[0];

  records.records = _.map(records.records, record => {
    record.images = _.map(record.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return record;
  });

  return records;

};

const delete_record = async (recordId) => {

  const db = await db_util.connect_db();
  const records = await db.collection('records').find({id: ObjectID(recordId)}).toArray();

  let images = [];

  _.each(records, (record) => {
    images = _.uniq(_.concat(images, record.images));
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    // TODO delete correct images from thumbnails and watermarks
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
    id: ObjectID(recordId)
  });

  await Promise.all([removeRecord, removeImages]);

  return true;
};

const get_all_forum_posts = async (query_params) => {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await db_util.connect_db();

  const data = await db.collection('forum_posts').aggregate([
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

const delete_forum_post = async (postId) => {
  const db = await db_util.connect_db();
  const post = await db.collection('forum_posts').findOne({_id: ObjectID(postId)});
  const $ = cheerio.load(post.postHTML);
  const images = [];

  _.forEach($('img'), (v, k) => {
    images.push(v.attribs.src);
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    const filename = _.split(image, '/').pop();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `forum-images/${filename}`
    };
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

  const removePost = db.collection('forum_posts').findOneAndDelete({_id: ObjectID(postId)});

  await Promise.all([removeImages, removePost]);

  return true;
};

module.exports = {
  get_user_by_uid,
  get_admin_users,
  remove_admin,
  add_admin,
  get_all_records,
  delete_record,
  get_all_forum_posts,
  delete_forum_post
};
