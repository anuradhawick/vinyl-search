const _ = require('lodash');
const db_util = require('../utils/db-util');

const update_user = async (uid, userdata) => {
  const db = await db_util.connect_db();

  await db.collection('users').findOneAndUpdate({uid: uid},
    {
      $set: {
        family_name: userdata.family_name,
        given_name: userdata.give_name,
        name: userdata.name,
        picture: '',
        updatedAt: new Date()
      }
    },
    {
      returnOriginal: false,
      upsert: false
    });

  return true;
};

const get_user = async (uid) => {
  const db = await db_util.connect_db();

  return await db.collection('users').findOne({uid: uid});
};

module.exports = {
  update_user,
  get_user
};
