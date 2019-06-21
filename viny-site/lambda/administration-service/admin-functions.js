const _ = require('lodash');
const db_util = require('../utils/db-util');
const ObjectID = require('mongodb').ObjectID;
const CognitoIdentityServiceProvider = require('aws-sdk').CognitoIdentityServiceProvider;

const get_user_by_uid = async (uid) => {
  const db = await db_util.connect_db();
  return await db.collection('users').findOne({uid: uid})
};

const get_admin_users = async () => {
  const db = await db_util.connect_db();
  return await db.collection('users').find({roles: "Admin"}).toArray();
};

const remove_admin = async (uid) => {
  const db = await db_util.connect_db();
  const cognito = new CognitoIdentityServiceProvider();
  const dbUser = await db.collection('users').findOne({uid});
  const cognitoUser = (await cognito.listUsers({
    UserPoolId: process.env.user_pool_id,
    Filter: `email = "${dbUser.email}"`
  }).promise()).Users[0];
  const username = cognitoUser.Username;

  await cognito.adminRemoveUserFromGroup({
    GroupName: 'Admin',
    UserPoolId: process.env.user_pool_id,
    Username: username
  }).promise();

  return await db.collection('users').updateOne(
    {
      uid, roles: "Admin"
    },
    {
      $pull: {
        roles: "Admin"
      }
    }
  );
};

const add_admin = async (uid) => {
  const db = await db_util.connect_db();
  const cognito = new CognitoIdentityServiceProvider();
  const dbUser = await db.collection('users').findOne({uid});
  const cognitoUser = (await cognito.listUsers({
    UserPoolId: process.env.user_pool_id,
    Filter: `email = "${dbUser.email}"`
  }).promise()).Users[0];
  const username = cognitoUser.Username;

  await cognito.adminAddUserToGroup({
    GroupName: 'Admin',
    UserPoolId: process.env.user_pool_id,
    Username: username
  }).promise();

  return await db.collection('users').updateOne(
    {
      uid
    },
    {
      $addToSet: {
        roles: "Admin"
      }
    }
  );
};

module.exports = {
  get_user_by_uid,
  get_admin_users,
  remove_admin,
  add_admin
};
