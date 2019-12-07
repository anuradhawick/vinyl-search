const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const S3 = require('aws-sdk').S3;
const path = require('path');
const Jimp = require('jimp');

const s3 = new S3();

search_posts = async (query_params) => {
  console.log(query_params)
  const materials = JSON.parse(_.get(query_params, 'material', '[]'));
  const gears = JSON.parse(_.get(query_params, 'gear', '[]'));
  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));
  const query = _.get(query_params, 'query', '');
  const db = await db_util.connect_db();

  const match = {
    $match: {
      latest: true
    }
  };

  // Add query filter
  if (!_.isEmpty(query)) {
    _.assign(match.$match, {
      $text: {
        $search: query
      }
    });
  }

  // Add filter
  if (!_.isEmpty(gears) || !_.isEmpty(materials)) {
    _.assign(match.$match, {
      $or: [
        {
          $and: [
            {
              saleType: {
                $eq: 'gear'
              } 
            },
            {
              saleSubtype: {
                $in: [...gears]
              }
            }
          ]
        },
        {
          $and: [
            {
              saleType: {
                $eq: 'material'
              } 
            },
            {
              saleSubtype: {
                $in: [...materials]
              }
            }
          ]
        },
      ]}
    );
  }

  const dbQuery = [match];

  if (!_.isEmpty(query)) {
    dbQuery.push(...[
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
      }
    ]);
  } else {
    dbQuery.push(
      {
        $sort: {
          "createdAt": -1
        }
      }
    );
  }

  // Commons
  dbQuery.push(...[
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
              name: 1,
              chosenImage: 1,
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
  ]);

  const data = await db.collection('selling_items').aggregate(dbQuery).toArray();
  const posts = data[0];

  posts.posts = _.map(posts.posts, post => {
    post.images = _.map(post.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/selling-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return post;
  });

  return posts;
};

fetch_posts = async (query_params) => {
  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));
  const db = await db_util.connect_db();
  const data = await db.collection('selling_items').aggregate([
    {
      $match: {
        latest: true,
        approved: true,
        sold: false
      }
    },
    {
      $sort: {
        createdAt: -1
      },
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
              name: 1,
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

// TODO remove access for un approved items
fetch_post = async (postId) => {
  const db = await db_util.connect_db();
  const data = await db.collection('selling_items').findOne({id: ObjectID(postId)});

  data.images = _.map(data.images, image => {
    return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/selling-images/watermarked/${path.parse(image).name}.jpeg`
  });

  return data;
};
//
// fetch_revision = async (revisionId) => {
//   const db = await db_util.connect_db();
//   const data = await db.collection('records').aggregate([
//     {
//       $match: {
//         _id: ObjectID(revisionId)
//       }
//     },
//     {
//       $lookup: {
//         from: 'users',
//         localField: 'reviserUid',
//         foreignField: 'uid',
//         as: 'reviser'
//       }
//     },
//     {
//       $addFields: {
//         reviser: {
//           $arrayElemAt: ['$reviser', 0]
//         }
//       }
//     },
//     {
//       $project: {
//         "reviser._id": 0,
//         "reviser.authProviders": 0,
//         "reviser.email": 0,
//         "reviser.updatedAt": 0
//       }
//     }
//   ]).toArray();
//
//   return data[0];
// };
//
// fetch_history = async (recordId) => {
//   const db = await db_util.connect_db();
//   const data = await db.collection('records').find(
//     {
//       id: ObjectID(recordId)
//     })
//     .project({
//       _id: 1,
//       createdAt: 1,
//       ownerUid: 1,
//       reviserUid: 1
//     })
//     .sort({createdAt: -1}).toArray();
//
//   return data;
// };

new_sell = async (uid, newSellingItem) => {
  const db = await db_util.connect_db();
  const ownerUid = uid;

  const newImages = await Promise.all(_.map(newSellingItem.images, (image) => {
    const filename = _.split(image, '/').pop();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      CopySource: `/${process.env.BUCKET_NAME}/temp/${filename}`,
      Key: `selling-images/${filename}`
    };
    return new Promise((resolve, reject) => {
      s3.copyObject(params, (err, data) => {
          if (err) {
            reject(err);
          }
          else {
            // create thumbnails and watermarks
            create_watermarks(params.Key).then(() => {
              resolve(filename);
            }).catch((error) => {
              console.error('watermarking ERROR', error);
              resolve(filename);
            });
          }
        }
      );
    });
  }));

  _.assign(newSellingItem, {ownerUid, createdAt: new Date()});
  _.assign(newSellingItem, {id: new ObjectID()});
  _.assign(newSellingItem, {latest: true});
  _.assign(newSellingItem, {approved: false});
  _.assign(newSellingItem, {sold: false});
  _.assign(newSellingItem, {paid: false});
  _.assign(newSellingItem, {images: newImages});

  await db.collection('selling_items').insertOne(newSellingItem);

  return {id: newSellingItem.id};
};

// performance gainers
const watermarkImageCache = null;

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

mark_as_sold = async (uid, newSellingItem) => {

};

approve_post_for_sale = async (uid, newSellingItem) => {

};
// update_record = async (reviserUid, recordId, record) => {
//   const db = await db_util.connect_db();
//   const newImages = await Promise.all(_.map(record.images, (image) => {
//     const list = _.split(image, '/');
//     const filename = list.pop();
//     const pathname = list.pop();
//     if (pathname === 'records-images') {
//       return image;
//     }
//     const params = {
//       Bucket: process.env.BUCKET_NAME,
//       CopySource: `/${process.env.BUCKET_NAME}/temp/${filename}`,
//       Key: `records-images/${filename}`
//     };
//     return new Promise((resolve, reject) => {
//       s3.copyObject(params, (err, data) => {
//           if (err) {
//             reject(image);
//           }
//           else {
//             resolve(`https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/${filename}`);
//           }
//         }
//       );
//     });
//   }));
//
//   _.unset(record, '_id');
//
//   await db.collection('records').updateMany(
//     {
//       id: ObjectID(recordId)
//     },
//     {
//       $set: {
//         latest: false
//       }
//     },
//     {
//       upsert: false
//     });
//
//   _.assign(record, {reviserUid, createdAt: new Date()});
//   _.assign(record, {id: ObjectID(record.id)});
//   _.assign(record, {latest: true});
//   _.assign(record, {images: newImages});
//
//   await db.collection('records').insertOne(record);
//
//   return record.id;
// };


module.exports = {
  search_posts,
  fetch_posts,
  fetch_post,
  new_sell,
  // update_record,
  // fetch_history,
  // fetch_revision
};
