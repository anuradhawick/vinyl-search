import { ObjectId } from 'mongodb';
import { S3Client, CopyObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import Jimp from 'jimp';
import _ from 'lodash';
import { connect_db } from './utils/db-util.js';


const s3 = new S3Client();
const BUCKET_NAME = process.env.BUCKET_NAME
const CDN_DOMAIN = process.env.CDN_DOMAIN


const readS3Stream = async (s3Response) => {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    s3Response.Body.on("data", (chunk) => chunks.push(chunk));
    s3Response.Body.on("end", () => resolve(Buffer.concat(chunks)));
    s3Response.Body.on("error", reject);
  });
};

export async function search_records(query_params) {
  const genres = JSON.parse(_.get(query_params, 'genres', '[]'));
  const styles = JSON.parse(_.get(query_params, 'styles', '[]'));
  const formats = JSON.parse(_.get(query_params, 'formats', '[]'));
  const countries = JSON.parse(_.get(query_params, 'countries', '[]'));
  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));
  const query = _.get(query_params, 'query', '');
  const db = await connect_db();

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
        data: [{ $count: "total" }],
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
  ]);

  const data = await db.collection('records').aggregate(dbQuery).toArray();
  const records = data[0];

  records.records = _.map(records.records, record => {
    record.images = _.map(record.images, image => {
      if (process.env.STAGE === 'prod') {
        return `https://cdn.vinyl.lk/records-images/thumbnails/${path.parse(image).name}.jpeg`
      } else {
        return `https://${CDN_DOMAIN}/records-images/thumbnails/${path.parse(image).name}.jpeg`
      }
    });
    return record;
  });

  return records;
};

export async function fetch_records(query_params) {
  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));
  const db = await connect_db();
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
        data: [{ $count: "total" }],
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

  const records = data[0];

  records.records = _.map(records.records, record => {
    record.images = _.map(record.images, image => {
      if (process.env.STAGE === 'prod') {
        return `https://cdn.vinyl.lk/records-images/thumbnails/${path.parse(image).name}.jpeg`
      } else {
        return `https://${CDN_DOMAIN}/records-images/thumbnails/${path.parse(image).name}.jpeg`
      }
    });
    return record;
  });

  return records;
};

export async function fetch_record(recordId) {
  const db = await connect_db();
  const data = await db.collection('records').findOne({ id: new ObjectId(recordId), latest: true });

  data.images = _.map(data.images, image => {
    if (process.env.STAGE === 'prod') {
      return `https://cdn.vinyl.lk/records-images/watermarked/${path.parse(image).name}.jpeg`;
    } else {
      return `https://${CDN_DOMAIN}/records-images/watermarked/${path.parse(image).name}.jpeg`;
    }
  }
  );

  return data;
};

export async function fetch_revision(revisionId) {
  const db = await connect_db();
  const data = await db.collection('records').aggregate([
    {
      $match: {
        _id: new ObjectId(revisionId)
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
    if (process.env.STAGE === 'prod') {
      return `https://cdn.vinyl.lk/records-images/watermarked/${path.parse(image).name}.jpeg`;
    } else {
      return `https://${CDN_DOMAIN}/records-images/watermarked/${path.parse(image).name}.jpeg`;
    }
  });

  return revision;
};

export async function fetch_history(recordId) {
  const db = await connect_db();
  const data = await db.collection('records').find(
    {
      id: new ObjectId(recordId)
    })
    .project({
      _id: 1,
      createdAt: 1,
      ownerUid: 1,
      reviserUid: 1
    })
    .sort({ createdAt: -1 }).toArray();

  return data;
};

// performance gainers
let watermarkImageCache = null;

export async function create_watermarks(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };
  const getS3Cmd = new GetObjectCommand(params);
  const s3Obj = await s3.send(getS3Cmd);
  const s3Data = await readS3Stream(s3Obj);
  const img = await Jimp.read(s3Data);
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

  const params1 = {
    Body: await wmBuffer,
    Bucket: params.Bucket,
    Key: watermarkedPath
  };
  const params2 = {
    Body: await smallBuffer,
    Bucket: params.Bucket,
    Key: thumbnailPath
  };
  const putS3Cmd1 = new PutObjectCommand(params1);
  const putS3Cmd2 = new PutObjectCommand(params2);

  await Promise.all([s3.send(putS3Cmd1), s3.send(putS3Cmd2)])
};

export async function new_record(uid_str, record) {
  const ownerUid = new ObjectId(uid_str);
  const db = await connect_db();
  const exists = await db.collection('records').findOne({ catalogNo: _.trim(_.get(record, 'catalogNo', '')) });

  if (!_.isEmpty(exists)) {
    return { recordId: false, originalId: exists.id };
  }

  const newImages = await Promise.all(_.map(record.images, async (image) => {
    const filename = _.split(image, '/').pop();
    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `/${BUCKET_NAME}/temp/${filename}`,
      Key: `records-images/${filename}`
    };
    const command = new CopyObjectCommand(params);
    await s3.send(command);
    await create_watermarks(params.Key);
    return filename;
  }));

  _.assign(record, { ownerUid, createdAt: new Date() });
  _.assign(record, { id: new ObjectId() });
  _.assign(record, { latest: true });
  _.assign(record, { images: newImages });

  await db.collection('records').insertOne(record);

  return { recordId: record.id };
};

export async function update_record(reviser_uid_str, recordId, record) {
  const reviserUid = new ObjectId(reviser_uid_str);
  const db = await connect_db();
  const newImages = await Promise.all(_.map(record.images, async (image) => {
    const pathstr = image.replace(/(.)*.vinyl.lk\//, '');
    const list = _.split(pathstr, '/');
    const filename = list.pop();
    const pathname = list[0];

    if (pathname === 'records-images') {
      return image;
    }
    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `/${BUCKET_NAME}/temp/${filename}`,
      Key: `records-images/${filename}`
    };
    const command = new CopyObjectCommand(params);
    await s3.send(command);
    await create_watermarks(params.Key);
    return filename;
  }));

  _.unset(record, '_id');

  await db.collection('records').updateMany(
    {
      id: new ObjectId(recordId)
    },
    {
      $set: {
        latest: false
      }
    },
    {
      upsert: false
    });

  _.assign(record, { reviserUid, createdAt: new Date() });
  _.assign(record, { id: new ObjectId(record.id) });
  _.assign(record, { latest: true });
  _.assign(record, { images: newImages });

  await db.collection('records').insertOne(record);

  return record.id;
};

