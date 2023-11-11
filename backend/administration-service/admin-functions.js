import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { S3Client } from '@aws-sdk/client-s3';
import { connect_db } from './utils/db-util.js';
import { CognitoIdentityProviderClient, ListUsersCommand, AdminRemoveUserFromGroupCommand, AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider"
import * as cheerio from 'cheerio';
import path from 'path';


const s3 = new S3Client();
const cognito = new CognitoIdentityProviderClient();
const BUCKET_NAME = process.env.BUCKET_NAME
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID
const CDN_DOMAIN = process.env.CDN_DOMAIN

async function list_users_by_email(email) {
  const params = {
    UserPoolId: COGNITO_USER_POOL_ID,
    Filter: `email = "${email}"`
  };
  const command = new ListUsersCommand(params);

  return (await cognito.send(command)).Users;
};

export async function get_user_by_uid(uid_str) {
  const db = await connect_db();
  return await db.collection('users').findOne({ _id: new ObjectId(uid_str) })
};

export async function get_admin_users() {
  const db = await connect_db();
  return await db.collection('users').find({ roles: "Admin" }).toArray();
};

export async function remove_admin(uid_str) {
  const db = await connect_db();
  const dbUser = await db.collection('users').findOne({ _id: new ObjectId(uid_str) });
  const cognitoUsers = await list_users_by_email(dbUser.email);

  if (_.isEmpty(cognitoUsers) || dbUser.email === 'anuradhawick@gmail.com') {
    return false;
  }

  const username = cognitoUsers[0].Username;
  const params = {
    GroupName: 'Admin',
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username
  };
  const command = new AdminRemoveUserFromGroupCommand(params);
  await cognito.send(command);


  await db.collection('users').updateOne(
    {
      _id: new ObjectId(uid_str), roles: "Admin"
    },
    {
      $pull: {
        roles: "Admin"
      }
    }
  );
  return true;
};

export async function add_admin(email) {
  const db = await connect_db();
  const cognitoUsers = await list_users_by_email(email);

  if (_.isEmpty(cognitoUsers)) {
    return false;
  }

  const username = cognitoUsers[0].Username;
  const params = {
    GroupName: 'Admin',
    UserPoolId: COGNITO_USER_POOL_ID,
    Username: username
  };
  const command = new AdminAddUserToGroupCommand(params);
  await cognito.send(command);

  await db.collection('users').updateOne(
    {
      email
    },
    {
      $addToSet: {
        roles: "Admin"
      }
    }
  );

  return true;
};

export async function get_all_records(query_params) {
  const limit = _.parseInt(_.get(query_params, 'limit', 30));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));
  const db = await connect_db();
  const data = await db.collection('records').aggregate([
    {
      $match: {
        latest: true
      }
    },
    {
      $facet: {
        data: [{ $count: "total" }],
        records: [
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $project: {
              name: 1,
              label: 1,
              genres: 1,
              chosenImage: 1,
              catalogNo: 1,
              images: 1,
              id: 1,
              score: 1
            }
          }
        ]
      }
    },
    {
      $addFields: { count: { $arrayElemAt: ["$data", 0] } }
    },
    {
      $addFields: {
        count: "$count.total",
        limit: limit,
        skip: skip
      }
    },
    {
      $project: {
        data: 0
      }
    }
  ]).toArray();

  const records = data[0];

  records.records = _.map(records.records, record => {
    record.images = _.map(record.images, image => {
      return `https://${CDN_DOMAIN}/records-images/thumbnails/${path.parse(image).name}.jpeg`
    });
    return record;
  });

  return records;

};

export async function delete_record(recordId) {

  const db = await connect_db();
  const records = await db.collection('records').find({ id: new ObjectId(recordId) }).toArray();

  let images = [];

  _.each(records, (record) => {
    images = _.uniq(_.concat(images, record.images));
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    // TODO delete correct images from thumbnails and watermarks
    const list = _.split(image, '/');
    const filename = list.pop();
    const pathname = list.pop();
    const params = {
      Bucket: BUCKET_NAME,
      Key: `records-images/${filename}`
    };

    if (pathname !== 'records-images') {
      return true;
    }

    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          resolve();
        }
        else {
          resolve()
        }
      }
      );
    });
  }));

  const removeRecord = db.collection('records').remove({
    id: new ObjectId(recordId)
  });

  await Promise.all([removeRecord, removeImages]);

  return true;
};

export async function get_all_forum_posts(query_params) {

  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('forum_posts').aggregate([
    {
      $facet: {
        data: [{ $count: "total" }],
        posts: [
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $addFields: {
              id: "$_id"
            }
          },
          {
            $project: {
              postTitle: 1,
              createdAt: 1,
              id: 1
            }
          }
        ]
      }
    },
    {
      $addFields: { count: { $arrayElemAt: ["$data", 0] } }
    },
    {
      $addFields: {
        count: "$count.total",
        limit: limit,
        skip: skip
      }
    },
    {
      $project: {
        data: 0
      }
    }
  ]).toArray();

  return data[0];
};

export async function delete_forum_post(postId) {
  const db = await connect_db();
  const post = await db.collection('forum_posts').findOne({ _id: new ObjectId(postId) });
  const $ = cheerio.load(post.postHTML);
  const images = [];

  _.forEach($('img'), (v, k) => {
    images.push(v.attribs.src);
  });

  const removeImages = Promise.all(_.map(images, (image) => {
    const filename = _.split(image, '/').pop();
    const params = {
      Bucket: BUCKET_NAME,
      Key: `forum-images/${filename}`
    };
    // TODO fix
    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          resolve();
        }
        else {
          resolve()
        }
      }
      );
    });
  }));

  const removePost = db.collection('forum_posts').findOneAndDelete({ _id: new ObjectId(postId) });

  await Promise.all([removeImages, removePost]);

  return true;
};

export async function get_user_reports(query_params) {
  const limit = _.parseInt(_.get(query_params, 'limit', 5));
  const skip = _.parseInt(_.get(query_params, 'skip', 0));

  const db = await connect_db();

  const data = await db.collection('reports').aggregate([
    {
      $facet: {
        data: [{ $count: "total" }],
        reports: [
          {
            $match: {
              resolved: false
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $addFields: {
              id: "$_id"
            }
          },
          {
            $project: {
              description: 1,
              type: 1,
              targetId: 1,
              createdAt: 1,
              id: 1
            }
          }
        ]
      }
    },
    {
      $addFields: { count: { $arrayElemAt: ["$data", 0] } }
    },
    {
      $addFields: {
        count: "$count.total",
        limit: limit,
        skip: skip
      }
    },
    {
      $project: {
        data: 0
      }
    }
  ]).toArray();

  return data[0];
};

export async function resolve_user_reports(reportId) {
  const db = await connect_db();

  await db.collection('reports').findOneAndUpdate(
    {
      _id: new ObjectId(reportId)
    },
    {
      $set: {
        resolved: true
      }
    }
  );

  return true;
};

