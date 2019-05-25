const admin = require('firebase-admin');
const _ = require('lodash');
const cors = require('cors')({origin: true});
const db_util = require('../../utils/db_util');
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');

edit_record = (req, res) => cors(req, res, async () => {
    const tokenId = _.replace(_.get(req.headers, 'authorization', ''), 'Bearer ', '');
    const db = await db_util.connect_db();
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const ownerUid = decodedToken.uid;
    const record = _.get(req, 'body.data', null);

    _.assign(record, {ownerUid, createdAt: new Date()});

    db.collection('records_edits').insertOne(record, (err, r) => {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount);

        res.status(200).send({data: {id: record._id}});
    });
});