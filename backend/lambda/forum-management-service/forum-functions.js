const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const htmlToText = require('html-to-text');

retrieve_post = async (postId) => {
    const db = await db_util.connect_db();
    const post = await db.collection('forum_posts').findOne({_id: ObjectID(postId)});

    _.assign(post, {id: post._id});

    return post;
};

retrieve_posts = async (queryStringParameters) => {
    const limit = _.parseInt(_.get(queryStringParameters, 'limit', 50));
    const skip = _.parseInt(_.get(queryStringParameters, 'skip', 0));
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
                    ownerName: "$user.name",
                    ownerPic: "$user.picture",
                    id: "$_id",
                }
            },
            {
                $addFields: {
                    ownerName: {$arrayElemAt: ["$ownerName", 0]},
                    ownerPic: {$arrayElemAt: ["$ownerPic", 0]},
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

    return posts[0];
};

search_posts = async (queryStringParameters) => {
    const limit = _.parseInt(_.get(queryStringParameters, 'limit', 50));
    const skip = _.parseInt(_.get(queryStringParameters, 'skip', 0));
    const query = _.get(queryStringParameters, 'query', '');
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
                    ownerName: "$user.name",
                    ownerPic: "$user.picture",
                    id: "$_id",
                }
            },
            {
                $addFields: {
                    ownerName: {$arrayElemAt: ["$ownerName", 0]},
                    ownerPic: {$arrayElemAt: ["$ownerPic", 0]},
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

    return posts[0];
};

save_post = async (uid, post, postId) => {
    const db = await db_util.connect_db();
    const ownerUid = uid;

    if (!_.isEmpty(postId)) {
        await db.collection('forum_posts').findOneAndUpdate(
            {
                _id: ObjectID(postId),
                ownerUid: uid
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
            });
            return postId;
    } else {
        _.assign(post, {ownerUid, createdAt: new Date()});
        _.assign(post, {textHTML: htmlToText.fromString(post.postHTML)});

        await db.collection('forum_posts').insertOne(post);

        return post._id;
    }
};

delete_post = async (uid, postId) => {
    const db = await db_util.connect_db();

    let query = {
        // ensure only the owner or an admin can delete
        _id: ObjectID(postId),
        ownerUid: uid
    };

    await db.collection('forum_posts').findOneAndDelete(query);

    return true;
};

module.exports = {
    retrieve_post,
    retrieve_posts,
    save_post,
    delete_post,
    search_posts
};