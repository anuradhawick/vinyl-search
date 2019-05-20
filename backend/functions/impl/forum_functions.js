const admin = require('firebase-admin');
const _ = require('lodash');
const assert = require('assert');
const cors = require('cors')({origin: true});
const db_util = require('../utils/db_util');
const ObjectID = require('mongodb').ObjectID;

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
    const limit = req.body.data.limit | 50;
    const skip = req.body.data.skip | 0;
    const db = await db_util.connect_db();
    const posts = await db.collection('forum_posts').aggregate([
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: limit
        },
        {
            $skip: skip
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
                id: "$_id"
            }
        },
        {
            $project: {
                user: 0,
                _id: 0
            }
        }
    ]).toArray();

    res.status(200).send({data: posts});
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
                    updatedAt: new Date()
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

        db.collection('forum_posts').insertOne(post, (err, r) => {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);

            res.status(200).send({data: {id: post._id}});
        });
    }
});

module.exports = {
    retrieve_post,
    retrieve_posts,
    save_post
};