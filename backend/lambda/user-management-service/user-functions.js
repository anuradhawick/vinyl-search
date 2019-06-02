const _ = require('lodash');
const db_util = require('../utils/db-util');

const update_user = async (uid, userdata) => {
    const db = await db_util.connect_db();

    await db.collection('users').findOneAndUpdate({ uid: uid },
        {
            $set:
            {
                email: userdata.email,
                family_name: userdata.emailVerified,
                given_name: userdata.displayName,
                name: userdata.photoURL,
                picture: userdata.phoneNumber,
                updatedAt: new Date()
            }
        },
        {
            returnOriginal: false,
            upsert: true
        });
    
    return true;
};

module.exports = {
    register_user
};
