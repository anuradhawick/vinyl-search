const admin = require('firebase-admin');
const _ = require('lodash');
const assert = require('assert');
const cors = require('cors')({ origin: true });
const db_util = require('../utils/db_util');

const register_user = (req, res) => cors(req, res, async () => {
    const tokenId = _.replace(_.get(req.headers, 'authorization', ''), 'Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(tokenId);
    const userdata = await admin.auth().getUser(decodedToken.uid);
    const db = await db_util.connect_db();

    db.collection('users').findOneAndUpdate({ uid: userdata.uid },
        {
            $set:
            {
                email: userdata.email,
                emailVerified: userdata.emailVerified,
                displayName: userdata.displayName,
                photoURL: userdata.photoURL,
                phoneNumber: userdata.phoneNumber,
                disabled: userdata.disabled,
                updatedAt: new Date()
            }
        },
        {
            returnOriginal: false,
            upsert: true
        },
        (err, r) => {
            assert.equal(null, err);

            res.status(200).send({ data: true });
        });
});

module.exports = {
    register_user
};
