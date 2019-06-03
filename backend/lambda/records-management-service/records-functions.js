const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const S3 = require('aws-sdk').S3;

const s3 = new S3();

search_records = async (query_params) => {
    const limit = _.parseInt(_.get(query_params, 'limit', 30));
    const skip = _.parseInt(_.get(query_params, 'skip', 0));
    const query = _.get(query_params, 'query', '');
    const db = await db_util.connect_db();
    const data = await db.collection('records').aggregate([
        {
            $match: {
                $text: {
                    $search: query
                },
                latest: true
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
            $skip: skip
        },
        {
            $limit: limit
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

    return data[0];
};

fetch_record = async (recordId) => {
    const db = await db_util.connect_db();
    const data = await db.collection('records').findOne({id: ObjectID(recordId), latest: true});

    return data;
};

fetch_revision = async (revisionId) => {
    const db = await db_util.connect_db();
    const data = await db.collection('records').findOne({_id: ObjectID(revisionId)});

    return data;
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

new_record = async (uid, record) => {
    const db = await db_util.connect_db();
    const ownerUid = uid;
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
                        reject(image);
                    }
                    else {
                        resolve(`https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/${filename}`);
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

    return record.id;
};

update_record = async (reviserUid, recordId, record) => {
    const db = await db_util.connect_db();
    const newImages = await Promise.all(_.map(record.images, (image) => {
        const list = _.split(image, '/');
        const filename = list.pop();
        const pathname = list.pop();
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
                        resolve(`https://${process.env.BUCKET_NAME}.s3-${process.env.BUCKET_REGION}.amazonaws.com/records-images/${filename}`);
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