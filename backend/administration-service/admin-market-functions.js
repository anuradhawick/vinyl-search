import _ from 'lodash';
import { connect_db } from './utils/db-util.js';
import { ObjectId } from 'mongodb';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import Jimp from 'jimp';


const s3 = new S3Client();
const BUCKET_NAME = process.env.BUCKET_NAME
const CDN_DOMAIN = process.env.CDN_DOMAIN


export async function pending_market_posts(query_params) {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        approved: false,
        latest: true,
        rejected: false,
        sold: false
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return `https://${CDN_DOMAIN}/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

export async function all_market_posts(query_params) {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        latest: true
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return `https://${CDN_DOMAIN}/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

export async function expired_and_rejected_posts(query_params) {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        latest: true,
        $or: [
          { rejected: true },
          {
            updatedAt: {
              $lt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            }
          }
        ]
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return `https://${CDN_DOMAIN}/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

export async function approved_posts(query_params) {
  // TODO NOT EXPIRED
  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        latest: true,
        $or: [
          { approved: true }
        ]
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

  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return `https://${CDN_DOMAIN}/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

export async function market_post_action(body) {
  // TODO set paid as true
  const type = body.type;
  const db = await connect_db();

  if (type === 'approve') {
    await db.collection('selling_items').updateOne(
      { id: new ObjectId(body.id) },
      {
        $set: {
          approved: true,
          paid: true
        }
      }
    );

    return true;
  }

  if (type === 'reject') {
    await db.collection('selling_items').updateOne(
      { id: new ObjectId(body.id) },
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

export async function get_market_post(postId) {
  const db = await connect_db();
  const data = await db.collection('selling_items').findOne({ id: new ObjectId(postId), latest: true });

  data.images = _.map(data.images, image => {
    return `https://${CDN_DOMAIN}/selling-images/watermarked/${path.parse(image).name}.jpeg`
  });

  return data;
};

// performance gainers
let watermarkImageCache = null;

create_watermarks = async (key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };
  const s3Obj = await s3.getObject(params).promise();
  const img = await Jimp.read(s3Obj.Body);
  const img2 = img.clone();

  let watermark;
  if (watermarkImageCache) {
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

export async function update_market_post(reviserUid, postId, post) {
  const db = await connect_db();
  const newImages = await Promise.all(_.map(post.images, (image) => {
    const pathstr = image.replace(/(.)*.amazonaws.com\//, '');
    const list = _.split(pathstr, '/');
    const filename = list.pop();
    const pathname = list[0];

    if (pathname === 'selling-images') {
      return image;
    }

    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `/${BUCKET_NAME}/temp/${filename}`,
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
      id: new ObjectId(postId)
    },
    {
      $set: {
        latest: false
      }
    },
    {
      upsert: false
    });

  _.assign(post, { reviserUid, createdAt: new Date() });
  _.assign(post, { id: new ObjectId(post.id) });
  _.assign(post, { updatedAt: new Date() });
  _.assign(post, { latest: true });
  _.assign(post, { images: newImages });

  await db.collection('selling_items').insertOne(post);

  return post.id;
};
