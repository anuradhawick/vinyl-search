const db_util = require('../utils/db-util');
const _ = require('lodash');
const CognitoIdentityServiceProvider = require('aws-sdk').CognitoIdentityServiceProvider;

update_user = async (uid, update) => {
    const db = await db_util.connect_db();
    await db.collection('users').findOneAndUpdate({uid: uid},
        update,
        {
            returnOriginal: false,
            upsert: true
        });
    return true
};

merge_users = async (userAttributes, username) => {
    const cognito = new CognitoIdentityServiceProvider();
    const users = await cognito.listUsers({
        UserPoolId: process.env.user_pool_id,
        Filter: `email = "${userAttributes.email}"`
    }).promise();

    if (!_.isEmpty(users.Users) && (_.split(username, '_')[0] === 'Google' || _.split(username, '_')[0] === 'Facebook')) {
        const firstuser = _.sortBy(users.Users, (user) => new Date(user.UserCreateDate))[0];
        const params = {
            DestinationUser: {
                ProviderAttributeValue: _.split(firstuser.Username, '_')[1],
                ProviderName: _.split(firstuser.Username, '_')[0]
            },
            SourceUser: {
                ProviderAttributeName: 'Cognito_Subject',
                ProviderAttributeValue: _.split(username, '_')[1],
                ProviderName: _.split(username, '_')[0]
            },
            UserPoolId: process.env.user_pool_id
        };

        await cognito.adminLinkProviderForUser(params).promise();
        await update_user(_.find(firstuser.Attributes, (attr) => attr.Name === 'sub').Value,
            {
                $addToSet: {
                    authProviders: _.split(username, '_')[0]
                }
            });
        return true;
    }
    return false;
};

create_cognito_user_if_none = async (userAttributes, username) => {
    // const cognito = new CognitoIdentityServiceProvider();
    //
    // const users = await cognito.listUsers({
    //     UserPoolId: process.env.user_pool_id,
    //     Filter: `email = "${userAttributes.email}"`
    // }).promise();
    //
    // if (_.split(username, '_')[0] === 'Google' || _.split(username, '_')[0] === 'Facebook') {
    //     const cognitoUser = _.filter(users.Users, (user) => user.UserStatus !== 'EXTERNAL_PROVIDER');
    //
    //     // if not available
    //     if (_.isEmpty(cognitoUser)) {
    //         const params = {
    //             UserPoolId: process.env.user_pool_id,
    //             Username: userAttributes.email,
    //             DesiredDeliveryMediums: ["EMAIL"],
    //             MessageAction: "SUPPRESS",
    //             UserAttributes: [
    //                 {
    //                     Name: 'email',
    //                     Value: userAttributes.email
    //                 },
    //             ],
    //         };
    //         await cognito.adminCreateUser(params).promise();
    //     }
    // }
};

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log("EVENT: ", event);

    if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {

        const userAttributes = event.request.userAttributes;
        const username = event.userName;
        const provider = _.split(username, '_')[0];

        let uid = event.request.userAttributes.sub;
        let picture = _.get(userAttributes, 'picture', '');

        try {
            if (provider === 'Facebook') {
                picture = JSON.parse(picture).data.url;
            }
        } catch (e) {
            console.error(e);
        }
        const update = {
            $set: {
                email: userAttributes.email,
                given_name: userAttributes.given_name,
                family_name: userAttributes.family_name,
                name: userAttributes.name,
                picture,
                updatedAt: new Date(),
                roles: []
            },
            $addToSet: {
                authProviders: provider
            }

        };

        update_user(uid, update).then(() => {
            callback(null, event);
        }).catch((err) => {
            callback(err, null);
        });
    } else if (event.triggerSource === 'PreSignUp_ExternalProvider') {
        const userAttributes = event.request.userAttributes;
        const username = event.userName;

        merge_users(userAttributes, username).then((merged) => {
            if (merged) {
                callback(new Error(`${_.split(username, '_')[0] || ''}`), event);

            } else {
                callback(null, event);
            }
        }).catch((err) => {
            callback(err, null);
        });
    } else {
        callback(null, event);
    }
};