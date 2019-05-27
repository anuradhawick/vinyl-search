const admin = require('firebase-admin');
const _ = require('lodash');
const assert = require('assert');
const cors = require('cors')({origin: true});
const db_util = require('../utils/db_util');
const ObjectID = require('mongodb').ObjectID;
const htmlToText = require('html-to-text');

retrieve_post = (req, res) => cors(req, res, async () => {
    const postId = req.body.data.postId;
    const db = await db_util.connect_db();
    const post = await db.collection('forum_posts').findOne({_id: ObjectID(postId)});

    _.assign(post, {id: post._id});

    if (_.isEmpty(post)) {
        res.status(404).send('Not Found');
    } else {
        res.status(200).send({data: post})
    }
});

retrieve_posts = (req, res) => cors(req, res, async () => {
    const limit = _.get(req, 'body.data.limit', 50);
    const skip = _.get(req, 'body.data.skip', 0);
    const db = await db_util.connect_db();
    const posts = await db.collection('forum_posts').aggregate([
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
                    ownerName: "$user.displayName",
                    ownerPic: "$user.photoURL",
                    id: "$_id",
                }
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
                    count: {$arrayElemAt: ["$data", 0]}
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

    res.status(200).send({data: posts[0]});
});


search_posts = (req, res) => cors(req, res, async () => {
    const limit = _.get(req, 'body.data.limit', 50);
    const skip = _.get(req, 'body.data.skip', 0);
    const query = _.get(req, 'body.data.query', '');
    const db = await db_util.connect_db();
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
                    ownerName: "$user.displayName",
                    ownerPic: "$user.photoURL",
                    id: "$_id",
                }
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
                    count: {$arrayElemAt: ["$data", 0]}
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

    res.status(200).send({data: posts[0]});
});

save_post = (req, res) => cors(req, res, async () => {
    const tokenId = _.replace(_.get(req.headers, 'authorization', ''), 'Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const db = await db_util.connect_db();
    const ownerUid = decodedToken.uid;
    const post = req.body.data;

    if (!_.isEmpty(post.id)) {
        db.collection('forum_posts').findOneAndUpdate(
            {
                _id: ObjectID(post.id)
            },
            {
                $set: {
                    postHTML: post.postHTML,
                    postTitle: post.postTitle,
                    updatedAt: new Date(),
                    textHTML: htmlToText.fromString(post.postHTML)
                }
            },
            {
                returnOriginal: false
            },
            (err, r) => {
                assert.equal(null, err);

                res.status(200).send({data: {id: post._id}});
            });
    } else {
        _.assign(post, {ownerUid, createdAt: new Date()});
        _.assign(post, {textHTML: htmlToText.fromString(post.postHTML)});


        db.collection('forum_posts').insertOne(post, (err, r) => {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);

            res.status(200).send({data: {id: post._id}});
        });
    }
});

delete_post = (req, res) => cors(req, res, async () => {
    const tokenId = _.replace(_.get(req.headers, 'authorization', ''), 'Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const db = await db_util.connect_db();
    const userUid = decodedToken.uid;
    const postId = req.body.data.postId;

    let query = {
        // ensure only the owner or an admin can delete
        _id: ObjectID(postId),
        ownerUid: userUid
    };

    db.collection('forum_posts').findOneAndDelete(
        query,
        (err, r) => {
            assert.equal(null, err);

            res.status(200).send({data: true});
        });
});

module.exports = {
    retrieve_post,
    retrieve_posts,
    save_post,
    delete_post,
    search_posts
};