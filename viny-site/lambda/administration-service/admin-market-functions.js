const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const CognitoIdentityServiceProvider = require('aws-sdk').CognitoIdentityServiceProvider;
const S3 = require('aws-sdk').S3;
const cheerio = require('cheerio');
const path = require('path');
const Jimp = require('jimp');

const s3 = new S3();

const pending_market_posts = async (query_params) => {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await db_util.connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        approved: false,
        latest: true,
        rejected: false
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
            $project: {
              name: 1,
              createdAt: 1,
              chosenImage: 1,
              images: 1,
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

const all_market_posts = async (query_params) => {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await db_util.connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        latest: true
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
            $project: {
              name: 1,
              createdAt: 1,
              chosenImage: 1,
              images: 1,
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

const expired_and_rejected_posts = async (query_params) => {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await db_util.connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        latest: true,
        $or: [
          {rejected: true}
        ]
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
            $project: {
              name: 1,
              createdAt: 1,
              chosenImage: 1,
              images: 1,
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

const approved_posts = async (query_params) => {
  // TODO NOT EXPIRED
  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await db_util.connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        latest: true,
        $or: [
          {approved: true}
        ]
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
            $project: {
              name: 1,
              createdAt: 1,
              chosenImage: 1,
              images: 1,
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

const market_post_action = async (body) => {
  const type = body.type;
  const db = await db_util.connect_db();

  if (type === 'approve') {
    await db.collection('selling_items').updateOne(
      { id: ObjectID(body.id) },
      { 
        $set: {
          approved: true
        }
      }
    );

    return true;
  }
  
  if (type === 'reject') {
    await db.collection('selling_items').updateOne(
      { id: ObjectID(body.id) },
      { 
        $set: {
          rejected: true
        }
      }
    );

    return true;
  }

  return false;
}

const get_market_post = async (postId) => {
  const db = await db_util.connect_db();
  const data = await db.collection('selling_items').findOne({id: ObjectID(postId), latest: true});

  data.images = _.map(data.images, image => {
    return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/selling-images/watermarked/${path.parse(image).name}.jpeg`
  });

  return data;
};

// performance gainers
let watermarkImageCache = null;

create_watermarks = async (key) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key
  };
  const s3Obj = await s3.getObject(params).promise();
  const img = await Jimp.read(s3Obj.Body);
  const img2 = img.clone();

  let watermark;
  if (watermarkImageCache)
  {
    watermark = watermarkImageCache.clone();
  } else {
    watermarkImageCache = await Jimp.read(__dirname + '/wm.png');
    watermark = watermarkImageCache.clone();
  }

  watermark = await watermark.scaleToFit(img2.bitmap.width, img2.bitmap.height);

  const smallBuffer = img.resize(100, Jimp.AUTO).getBufferAsync(Jimp.MIME_JPEG);
  const wmBuffer = img2.composite(watermark,
    img2.bitmap.width / 2 - watermark.bitmap.width / 2,
    img2.bitmap.height / 2 - watermark.bitmap.height / 2,
    {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.22
    }).getBufferAsync(Jimp.MIME_JPEG);

  const thumbnailPath = `${path.dirname(key)}/thumbnails/${path.parse(key).name}.jpeg`;
  const watermarkedPath = `${path.dirname(key)}/watermarked/${path.parse(key).name}.jpeg`;

  const params11 = {
    Body: await wmBuffer,
    Bucket: params.Bucket,
    Key: watermarkedPath
  };
  const params12 = {
    Body: await smallBuffer,
    Bucket: params.Bucket,
    Key: thumbnailPath
  };

  await Promise.all([s3.putObject(params11).promise(), s3.putObject(params12).promise()])
};

const update_market_post = async(reviserUid, postId, post) => {
  const db = await db_util.connect_db();
  const newImages = await Promise.all(_.map(post.images, (image) => {
    const pathstr = image.replace(/(.)*.amazonaws.com\//, '');
    const list = _.split(pathstr, '/');
    const filename = list.pop();
    const pathname = list[0];
    
    if (pathname === 'selling-images') {
      return image;
    }
    
    const params = {
      Bucket: process.env.BUCKET_NAME,
      CopySource: `/${process.env.BUCKET_NAME}/temp/${filename}`,
      Key: `selling-images/${filename}`
    };
    return new Promise((resolve, reject) => {
      s3.copyObject(params, (err, data) => {
          if (err) {
            reject(image);
          }
          else {
            // create thumbnails and watermarks
            create_watermarks(params.Key).then(() => {
              resolve(filename);
            }).catch((error) => {
              console.log('watermarking ERROR', error);
              resolve(filename);
            });
          }
        }
      );
    });
  }));
  
  _.unset(post, '_id');

  await db.collection('selling_items').updateMany(
    {
      id: ObjectID(postId)
    },
    {
      $set: {
        latest: false
      }
    },
    {
      upsert: false
    });

  _.assign(post, {reviserUid, createdAt: new Date()});
  _.assign(post, {id: ObjectID(post.id)});
  _.assign(post, {latest: true});
  _.assign(post, {images: newImages});

  await db.collection('selling_items').insertOne(post);

  return post.id;
};

module.exports = {
  pending_market_posts,
  all_market_posts,
  expired_and_rejected_posts,
  market_post_action,
  approved_posts,
  get_market_post,
  update_market_post
};
