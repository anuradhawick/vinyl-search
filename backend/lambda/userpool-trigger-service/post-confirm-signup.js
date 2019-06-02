const db_util = require('../utils/db-util');
const _ = require('lodash');

register_user = async (uid, user) => {
    const db = await db_util.connect_db();
    await db.collection('users').findOneAndUpdate({ uid: uid },
        {
            $set: user
        },
        {
            returnOriginal: false,
            upsert: true
        });
    return true
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('EVENT: ', event)

    // Ignore other triggers like PostConfirmation_ConfirmForgotPassword
    if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
        const userAttributes = event.request.userAttributes;
        const uid = event.request.userAttributes.sub;
        let picture = _.get(userAttributes, 'picture', '');
        let provider = null;

        try {
            provider = JSON.parse(userAttributes.identities)[0].providerName;

            if (provider === 'Facebook') {
                picture = JSON.parse(picture).data.url;
            }
        } catch (e) {
            console.error(e);
        }

        const newUser = {
            email: userAttributes.email,
            given_name: userAttributes.given_name,
            family_name: userAttributes.family_name,
            name: userAttributes.name,
            picture,
            authProvider: provider,
            updatedAt: new Date()
        }

        register_user(uid, newUser).then(() => {
            callback(null, event);
        }).catch((err) => {
            callback(err, null);
        });

    } else {
        callback(null, event);
    }
};