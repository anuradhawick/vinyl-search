const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;

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
    const data = await db.collection('records').findOne({id: ObjectID(recordId)});

    return data;
};

new_record = async (uid, record) => {
    const db = await db_util.connect_db();
    const ownerUid = uid;

    _.assign(record, {ownerUid, createdAt: new Date()});
    _.assign(record, {id: new ObjectID()});
    _.assign(record, {latest: true});

    await db.collection('records').insertOne(record);

    return record.id;
};

new_genre = (req, res) => cors(req, res, async () => {
    const tokenId = _.replace(_.get(req.headers, 'authorization', ''), 'Bearer ', '');
    const db = await db_util.connect_db();
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const ownerUid = decodedToken.uid;

    assert.equal(false, _.isEmpty(_.get(req, 'body.data.genre', null)));

    const record = {
        name: _.startCase(_.lowerCase(req.body.data.genre)),
        ownerUid,
        createAt: new Date(),
        styles: []
    };

    db.collection('records-metadata').insertOne(record, (err, r) => {
        assert.equal(null, err);

        res.status(200).send({data: true});
    });
});

new_style = (req, res) => cors(req, res, async () => {
    const tokenId = _.replace(_.get(req.headers, 'authorization', ''), 'Bearer ', '');
    const db = await db_util.connect_db();
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const ownerUid = decodedToken.uid;
    const styles = _.map(_.get(req, 'body.data.styles', []), (item) => _.startCase(_.lowerCase(item)));

    db.collection('records-metadata').findOneAndUpdate(
        {
            name: _.get(req, "body.data.genre", "")
        },
        {
            $addToSet: {
                styles: {
                    $each: styles
                }
            }
        },
        {
            returnOriginal: false
        }
        ,
        (err, r) => {
            assert.equal(null, err);

            res.status(200).send({data: true});
        });
});


module.exports = {
    search_records,
    fetch_records,
    fetch_record,
    new_record,
    new_genre,
    new_style
}