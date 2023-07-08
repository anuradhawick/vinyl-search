import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { S3Client } from '@aws-sdk/client-s3';
import { connect_db } from './utils/db-util.js';
import * as cheerio from 'cheerio';


const s3 = new S3Client();
const BUCKET_NAME = process.env.BUCKET_NAME


export async function update_user(uid, userdata) {
  const db = await connect_db();

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

  const newUserData = await db.collection('users').findOneAndUpdate({ _id: new ObjectId(uid) },
    set_user,
    {
      returnOriginal: false,
      upsert: false
    });

  return newUserData;
};


export async function get_user(uid_str) {
  const db = await connect_db();
  const uid = new ObjectId(uid_str);

  return await db.collection('users').findOne({ _id: uid });
};

export async function get_user_records(uid_str, query_params) {
  const uid = new ObjectId(uid_str);
  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));
  const db = await connect_db();
  const data = await db.collection('records').aggregate([
    {
      $match: {
        ownerUid: uid,
        latest: true
      }
    },
    {
      $facet: {
        data: [{ $count: "total" }],
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
      $addFields: { count: { $arrayElemAt: ["$data", 0] } }
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


export async function get_user_forum_posts(uid_str, query_params) {
  const uid = new ObjectId(uid_str);
  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('forum_posts').aggregate([
    {
      $match: {
        ownerUid: uid
      }
    },
    {
      $facet: {
        data: [{ $count: "total" }],
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
      $addFields: { count: { $arrayElemAt: ["$data", 0] } }
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


export async function delete_forum_post(uid_str, postId) {
  const uid = new ObjectId(uid_str);
  const db = await connect_db();
  const post = await db.collection('forum_posts').findOne({ _id: new ObjectId(postId) });
  const $ = cheerio.load(post.postHTML);
  const images = [];

  _.forEach($('img'), (v, k) => {
    images.push(v.attribs.src);
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    const filename = _.split(image, '/').pop();
    const params = {
      Bucket: BUCKET_NAME,
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

  const removePost = db.collection('forum_posts').findOneAndDelete({
    _id: new ObjectId(postId),
    ownerUid: uid
  });

  await Promise.all([removeImages, removePost]);

  return true;
};

export async function get_user_market_posts(uid_str, query_params) {
  const uid = new ObjectId(uid_str);
  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        ownerUid: uid
      }
    },
    {
      $facet: {
        data: [{ $count: "total" }],
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
            $project: {
              name: 1,
              createdAt: 1,
              chosenImage: 1,
              images: 1,
              id: 1,
              approved: 1,
              rejected: 1,
              sold: 1
            }
          }
        ]
      }
    },
    {
      $addFields: { count: { $arrayElemAt: ["$data", 0] } }
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

export async function mark_selling_item_as_sold(uid_str, postId) {
  const uid = new ObjectId(uid_str);
  const db = await connect_db();

  await db.collection('selling_items').findOneAndUpdate(
    {
      ownerUid: uid,
      _id: new ObjectId(postId)
    },
    {
      $set: {
        sold: true
      }
    }
  )
};


export async function delete_record(uid_str, recordId) {
  const uid = new ObjectId(uid_str);
  const db = await connect_db();
  const records = await db.collection('records').find({ id: new ObjectId(recordId) }).toArray();

  let images = [];

  _.each(records, (record) => {
    images = _.uniq(_.concat(images, record.images));
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    const list = _.split(image, '/');
    const filename = list.pop();
    const pathname = list.pop();
    const params = {
      Bucket: BUCKET_NAME,
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
    id: new ObjectId(recordId),
    ownerUid: uid
  });

  await Promise.all([removeRecord, removeImages]);

  return true;
};

export async function delete_marketplace_ad(uid_str, postID) {
  const uid = new ObjectId(uid_str);
  const db = await connect_db();
  const posts = await db.collection('selling_items').find({ id: new ObjectId(postID) }).toArray();

  let images = [];

  _.each(posts, (post) => {
    images = _.uniq(_.concat(images, post.images));
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    const list = _.split(image, '/');
    const filename = list.pop();
    const pathname = list.pop();
    const params = {
      Bucket: BUCKET_NAME,
      Key: `selling-images/${filename}`
    };

    if (pathname !== 'selling-images') {
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

  const removeSellingItem = db.collection('selling_items').remove({
    id: new ObjectId(postID),
    ownerUid: uid
  });

  await Promise.all([removeSellingItem, removeImages]);

  return true;
};
