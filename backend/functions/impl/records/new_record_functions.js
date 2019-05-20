const admin = require('firebase-admin');
const _ = require('lodash');
const cors = require('cors')({origin: true});
const db_util = require('../../utils/db_util');
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');

new_record = (req, res) => cors(req, res, async () => {
    const tokenId = _.replace(_.get(req.headers, 'authorization', ''), 'Bearer ', '');
    const db = await db_util.connect_db();
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const ownerUid = decodedToken.uid;

    assert.equal(false, _.isEmpty(_.get(req, 'body.data', null)));

    const record = _.get(req, 'body.data', null);

    if (!_.isEmpty(record.id)) {
        db.collection('records').findOneAndUpdate(
            {
                _id: ObjectID(record.id)
            },
            {
                $set: record
            },
            {
                returnOriginal: false
            },
            (err, r) => {
                assert.equal(null, err);

                res.status(200).send({data: {id: record._id}});
            });
    } else {
        _.assign(record, {ownerUid, createdAt: new Date()});

        db.collection('records').insertOne(record, (err, r) => {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);

            res.status(200).send({data: {id: record._id}});
        });
    }
});

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
    new_record,
    new_genre,
    new_style
};