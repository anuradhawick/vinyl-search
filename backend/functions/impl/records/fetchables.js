const admin = require('firebase-admin');
const _ = require('lodash');
const cors = require('cors')({origin: true});
const db_util = require('../../utils/db_util');
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');

const fetch_genres = (req, res) => cors(req, res, async () => {
    const db = await db_util.connect_db();
    const data = await db.collection('records-metadata').find().sort({name: 1}).toArray();

    res.status(200).send({data: data});
});

const fetch_record = (req, res) => cors(req, res, async () => {
    const db = await db_util.connect_db();
    const data = await db.collection('records').findOne({id: ObjectID(req.body.data.id)});

    res.status(200).send({data: data})
});

const fetch_records = (req, res) => cors(req, res, async () => {
    const limit = _.get(req, 'body.data.limit', 30);
    const skip = _.get(req, 'body.data.skip', 0);
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

    res.status(200).send({data: data[0]})
});

const search_records = (req, res) => cors(req, res, async () => {
    const limit = _.get(req, 'body.data.limit', 30);
    const skip = _.get(req, 'body.data.skip', 0);
    const query = _.get(req, 'body.data.query', '');
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

    res.status(200).send({data: data[0]})
});

module.exports = {
    fetch_genres,
    fetch_record,
    fetch_records,
    search_records
};