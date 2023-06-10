import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { S3Client } from '@aws-sdk/client-s3';
import { connect_db } from './utils/db-util.js';
import { convert} from 'html-to-text';
import * as cheerio from 'cheerio';


const s3 = new S3Client();
const BUCKET_NAME = process.env.BUCKET_NAME
const CDN_DOMAIN = process.env.CDN_DOMAIN


export async function retrieve_post(postId) {
  const db = await connect_db();
  const post = await db.collection('forum_posts').findOne({ _id: new ObjectId(postId) });

  _.assign(post, { id: post._id });

  return post;
};

export async function retrieve_post_comments(postId) {
  const db = await connect_db();
  const comments = await db.collection('forum_posts').aggregate([
    {
      $match: {
        comment: true,
        comment_for: new ObjectId(postId)
      }
    },
    {
      $sort: {
        createdAt: 1
      }
    }
  ]).toArray();

  return comments;
};

export async function retrieve_posts(queryStringParameters) {
  const limit = _.parseInt(_.get(queryStringParameters, 'limit', 50));
  const skip = _.parseInt(_.get(queryStringParameters, 'skip', 0));
  const db = await connect_db();
  const posts = await db.collection('forum_posts').aggregate([
    {
      $match: {
        comment: false
      }
    },
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'ownerUid',
        foreignField: 'uid',
        as: 'user'
      }
    },
    {
      $addFields: {
        ownerName: "$user.name",
        ownerPic: "$user.picture",
        id: "$_id",
      }
    },
    {
      $addFields: {
        ownerName: { $arrayElemAt: ["$ownerName", 0] },
        ownerPic: { $arrayElemAt: ["$ownerPic", 0] },
      }
    },
    {
      $facet: {
        data: [{ $count: "total" }],
        posts: [
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $project: {
              user: 0,
              _id: 0,
              postHTML: 0,
              textHTML: 0
            }
          }
        ]
      }
    },
    {
      $addFields: {
        count: { $arrayElemAt: ["$data", 0] }
      }
    },
    {
      $project: {
        data: 0,
      }
    },
    {
      $addFields: {
        count: "$count.total",
        skip: skip,
        limit: limit
      }
    }

  ]
  ).toArray();

  return posts[0];
};

export async function search_posts(queryStringParameters) {
  const limit = _.parseInt(_.get(queryStringParameters, 'limit', 50));
  const skip = _.parseInt(_.get(queryStringParameters, 'skip', 0));
  const query = _.get(queryStringParameters, 'query', '');
  const db = await connect_db();
  const posts = await db.collection('forum_posts').aggregate([
    {
      $match: {
        $text: {
          $search: query
        }
      }
    },
    {
      $addFields: {
        score: {
          $meta: "textScore"
        }
      }

    },
    {
      $sort: {
        "score": 1
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'ownerUid',
        foreignField: 'uid',
        as: 'user'
      }
    },
    {
      $addFields: {
        ownerName: "$user.name",
        ownerPic: "$user.picture",
        id: "$_id",
      }
    },
    {
      $addFields: {
        ownerName: { $arrayElemAt: ["$ownerName", 0] },
        ownerPic: { $arrayElemAt: ["$ownerPic", 0] },
      }
    },
    {
      $facet: {
        data: [{ $count: "total" }],
        posts: [
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $project: {
              user: 0,
              _id: 0,
              postHTML: 0,
              textHTML: 0
            }
          }
        ]
      }
    },
    {
      $addFields: {
        count: { $arrayElemAt: ["$data", 0] }
      }
    },
    {
      $project: {
        data: 0,
      }
    },
    {
      $addFields: {
        count: "$count.total",
        skip: skip,
        limit: limit
      }
    }

  ]
  ).toArray();

  return posts[0];
};

export async function save_post(uid, post, postId) {
  const db = await connect_db();
  const ownerUid = uid;
  const $ = cheerio.load(post.postHTML);
  const images = [];
  const allimages = [];
  const comment = _.get(post, "comment", false);
  const comment_for = postId;

  _.forEach($('img'), (v, k) => {
    const list = v.attribs.src.split('/');
    const filename = list.pop();
    const path = list.pop();
    if (path === 'temp') {
      images.push(v.attribs.src)
      v.attribs.src = `https://${CDN_DOMAIN}/forum-images/${filename}`;
    }
    allimages.push(v.attribs.src);
  });

  post.postHTML = $.html();

  const imageProcess = Promise.all(_.map(images, (image) => {
    const filename = _.split(image, '/').pop();
    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `/${BUCKET_NAME}/temp/${filename}`,
      Key: `forum-images/${filename}`
    };
    return new Promise((resolve, reject) => {
      s3.copyObject(params, (err, data) => {
        if (err) {
          reject(err)
        }
        else {
          resolve()
        }
      }
      );
    });
  }));

  await imageProcess;

  if (!_.isEmpty(postId) && !comment) {
    const data = await db.collection('forum_posts').findOneAndUpdate(
      {
        _id: new ObjectId(postId),
        ownerUid: uid
      },
      {
        $set: {
          postHTML: post.postHTML,
          postTitle: post.postTitle,
          updatedAt: new Date(),
          textHTML: convert(post.postHTML)
        }
      },
      {
        returnOriginal: true
      });

    if (data.ok === 1) {
      const oldpost = data.value;
      const $ = cheerio.load(oldpost.postHTML);
      const oldimages = [];

      _.forEach($('img'), (v, k) => {
        oldimages.push(v.attribs.src)
      });

      // check for missing old images and delete them
      const removedImages = _.filter(oldimages, (i) => {
        return _.findIndex(allimages, (a) => a === i) === -1;
      });

      const removeProcess = Promise.all(_.map(removedImages, (image) => {
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

      await removeProcess;
    }

    return postId;
  } else if (comment) {
    _.assign(post, { ownerUid, createdAt: new Date(), comment: true, comment_for: new ObjectId(comment_for) });
    _.assign(post, { textHTML: convert(post.postHTML) });

    await db.collection('forum_posts').insertOne(post);

    return post._id;
  } else {
    _.assign(post, { ownerUid, createdAt: new Date(), comment: false });
    _.assign(post, { textHTML: convert(post.postHTML) });

    await db.collection('forum_posts').insertOne(post);

    return post._id;
  }
};

export async function delete_post(uid, postId) {
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
