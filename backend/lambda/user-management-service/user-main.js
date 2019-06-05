'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const user_functions = require('./user-functions');
const CognitoIdentityServiceProvider = new require('aws-sdk').CognitoIdentityServiceProvider;
const _ = require('lodash');

const cognito = new CognitoIdentityServiceProvider();

exports.main = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const router = new lambdaRouter.Router(event, context, callback);

    /**
     * update user
     */
    router.route(
        'POST',
        '/users',
        (event, context, callback) => {

            console.log('users');
            cognito.listUsers({
                UserPoolId: process.env.user_pool_id,
                Filter: 'email = "anuradhawick@gmail.com"'
            }).promise().then((u) => {
                console.log(u.Users)

                let uuu = _.find(u.Users[0].Attributes, (attr) => attr.Name === 'sub').Value

                console.log(uuu)
            });

            // var params = {
            //     UserPoolId: process.env.user_pool_id, /* required */
            //     Username: 'Google_105315013893547490786' /* required */
            // };
            // cognito.adminDeleteUser(params, function(err, data) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log(data);           // successful response
            // });
            // var params = {
            //     UserPoolId: process.env.user_pool_id, /* required */
            //     Username: 'Facebook_10219144703678364' /* required */
            // };
            // cognito.adminDeleteUser(params, function(err, data) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log(data);           // successful response
            // });
            // var params = {
            //     UserPoolId: process.env.user_pool_id, /* required */
            //     Username: 'anuradhawick@gmail.com' /* required */
            // };
            // cognito.adminDeleteUser(params, function(err, data) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log(data);           // successful response
            // });

            // const params = {
            //     UserPoolId: process.env.user_pool_id, /* required */
            //     Username: "anuradhawick@gmail.com", /* required */
            //     DesiredDeliveryMediums: ["EMAIL"],
            //     MessageAction: "SUPPRESS",
            //     UserAttributes: [
            //         {
            //             Name: 'email', /* required */
            //             Value: 'anuradhawick@gmail.com'
            //         },
            //     ],
            //
            // };
            // cognito.adminCreateUser(params, function (err, data) {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log(data);           // successful response
            // });

            // cognito.adminLinkProviderForUser({
            //     DestinationUser: {
            //         // ProviderAttributeName: "Username",
            //         ProviderAttributeValue: "105315013893547490786",
            //         ProviderName: "Google"
            //     },
            //     SourceUser: {
            //         ProviderAttributeName: "Cognito_Subject",
            //         ProviderAttributeValue: "10219144703678364",
            //         ProviderName: "Facebook"
            //     },
            //     UserPoolId: process.env.user_pool_id
            // }, (err, data) => {
            //     if (err) console.log(err, err.stack); // an error occurred
            //     else     console.log('Success', data);           // successful response
            // })
            //
            //
            // user_functions.update_user(event.requestContext.authorizer.claims['sub'], event.body).then((data) => {
            //     callback(null, lambdaRouter.builResponse(200, {
            //         success: true
            //     }));
            // }).catch((e) => {
            //     callback(null, lambdaRouter.builResponse(500, {
            //         records: "ERROR",
            //         success: false
            //     }));
            // });

        }
    );
}