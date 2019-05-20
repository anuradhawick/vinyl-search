const admin = require('firebase-admin');
const _ = require('lodash');
const cors = require('cors')({origin: true});
const db_util = require('../../utils/db_util');
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');

const fetch_genres = (req, res) => cors(req, res, async () => {
    const db = await db_util.connect_db();
    const data = await db.collection('records-metadata').find().sort({name: 1}).toArray();

    res.status(200).send({data: data})
});

module.exports = {
    fetch_genres
};