const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const S3 = require('aws-sdk').S3;
const path = require('path');
const Jimp = require('jimp');

const s3 = new S3();

search_records = async (query_params) => {
  const genres = JSON.parse(_.get(query_params, 'genres', '[]'));
  const styles = JSON.parse(_.get(query_params, 'styles', '[]'));
  const formats = JSON.parse(_.get(query_params, 'formats', '[]'));
  const countries = JSON.parse(_.get(query_params, 'countries', '[]'));
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

  // Add genres filter
  if (!_.isEmpty(genres)) {
    _.assign(match.$match, {
      genres: {
        $all: [...genres]
      }
    });
  }

  // Add styles filter
  if (!_.isEmpty(styles)) {
    _.assign(match.$match, {
      styles: {
        $all: [...styles]
      }
    });
  }

  // Add formats filter
  if (!_.isEmpty(formats)) {
    _.assign(match.$match, {
      format: {
        $in: [...formats]
      }
    });
  }

  // Add countries filter
  if (!_.isEmpty(countries)) {
    _.assign(match.$match, {
      country: {
        $in: [...countries]
      }
    });
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
  ]);

  const data = await db.collection('records').aggregate(dbQuery).toArray();
  const records = data[0];

  records.records = _.map(records.records, record => {
    record.images = _.map(record.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return record;
  });

  return records;
};

fetch_records = async (query_params) => {
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
      $sort: {
        createdAt: -1
      },
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

  const records = data[0];

  records.records = _.map(records.records, record => {
    record.images = _.map(record.images, image => {
      return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return record;
  });

  return records;
};

fetch_record = async (recordId) => {
  const db = await db_util.connect_db();
  const data = await db.collection('records').findOne({id: ObjectID(recordId), latest: true});

  data.images = _.map(data.images, image => {
    return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/watermarked/${path.parse(image).name}.jpeg`
  });

  return data;
};

fetch_revision = async (revisionId) => {
  const db = await db_util.connect_db();
  const data = await db.collection('records').aggregate([
    {
      $match: {
        _id: ObjectID(revisionId)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'reviserUid',
        foreignField: 'uid',
        as: 'reviser'
      }
    },
    {
      $addFields: {
        reviser: {
          $arrayElemAt: ['$reviser', 0]
        }
      }
    },
    {
      $project: {
        "reviser._id": 0,
        "reviser.authProviders": 0,
        "reviser.email": 0,
        "reviser.updatedAt": 0
      }
    }
  ]).toArray();

  const revision = data[0];

  revision.images = _.map(revision.images, image => {
    return  `https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/watermarked/${path.parse(image).name}.jpeg`
  });

  return revision;
};

fetch_history = async (recordId) => {
  const db = await db_util.connect_db();
  const data = await db.collection('records').find(
    {
      id: ObjectID(recordId)
    })
    .project({
      _id: 1,
      createdAt: 1,
      ownerUid: 1,
      reviserUid: 1
    })
    .sort({createdAt: -1}).toArray();

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

new_record = async (uid, record) => {
  const db = await db_util.connect_db();
  const ownerUid = uid;
  const exists = await db.collection('records').findOne({catalogNo: _.trim(_.get(record, 'catalogNo', ''))});

  if (!_.isEmpty(exists)) {
    return {recordId: false, originalId: exists.id};
  }

  const newImages = await Promise.all(_.map(record.images, (image) => {
    const filename = _.split(image, '/').pop();
    const params = {
      Bucket: process.env.BUCKET_NAME,
      CopySource: `/${process.env.BUCKET_NAME}/temp/${filename}`,
      Key: `records-images/${filename}`
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

  _.assign(record, {ownerUid, createdAt: new Date()});
  _.assign(record, {id: new ObjectID()});
  _.assign(record, {latest: true});
  _.assign(record, {images: newImages});

  await db.collection('records').insertOne(record);

  return {recordId: record.id};
};

update_record = async (reviserUid, recordId, record) => {
  const db = await db_util.connect_db();
  const newImages = await Promise.all(_.map(record.images, (image) => {
    const pathstr = image.replace(/(.)*.amazonaws.com\//, '');
    const list = _.split(pathstr, '/');
    const filename = list.pop();
    const pathname = list[0];

    if (pathname === 'records-images') {
      return image;
    }
    const params = {
      Bucket: process.env.BUCKET_NAME,
      CopySource: `/${process.env.BUCKET_NAME}/temp/${filename}`,
      Key: `records-images/${filename}`
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
              console.error('watermarking ERROR', error);
              resolve(filename);
            });
          }
        }
      );
    });
  }));

  _.unset(record, '_id');

  await db.collection('records').updateMany(
    {
      id: ObjectID(recordId)
    },
    {
      $set: {
        latest: false
      }
    },
    {
      upsert: false
    });

  _.assign(record, {reviserUid, createdAt: new Date()});
  _.assign(record, {id: ObjectID(record.id)});
  _.assign(record, {latest: true});
  _.assign(record, {images: newImages});

  await db.collection('records').insertOne(record);

  return record.id;
};


module.exports = {
  search_records,
  fetch_records,
  fetch_record,
  new_record,
  update_record,
  fetch_history,
  fetch_revision
};
