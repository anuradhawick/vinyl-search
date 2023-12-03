import _ from "lodash";
import { ObjectId } from "mongodb";
import { connect_db } from "./utils/db-util.js";

export const get_users = async (query_params) => {
  const limit = _.parseInt(_.get(query_params, "limit", 5));
  const skip = _.parseInt(_.get(query_params, "skip", 0));
  const db = await connect_db();
  const data = await db
    .collection("users")
    .aggregate([
      {
        $facet: {
          data: [
            {
              $count: "total",
            },
          ],
          users: [
            {
              $sort: {
                _id: 1,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
            {
              $project: {
                name: 1,
                email: 1,
                picture: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          count: {
            $arrayElemAt: ["$data.total", 0],
          },
          limit: limit,
          skip: skip,
        },
      },
      {
        $project: {
          data: 0,
        },
      },
    ])
    .toArray();

  return data[0];
};

export const get_user_by_uid = async (uid_str) => {
  const db = await connect_db();
  return await db.collection("users").findOne({ _id: new ObjectId(uid_str) });
};
