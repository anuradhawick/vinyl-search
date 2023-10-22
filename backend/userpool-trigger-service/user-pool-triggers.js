import _ from 'lodash';
import { connect_db } from './utils/db-util.js';
import { CognitoIdentityProviderClient, ListUsersCommand, AdminLinkProviderForUserCommand, AdminUpdateUserAttributesCommand } from "@aws-sdk/client-cognito-identity-provider";


const cognito = new CognitoIdentityProviderClient();

const update_user = async (email, update) => {
  const db = await connect_db();
  return await db.collection('users').findOneAndUpdate({ email },
    update,
    {
      returnOriginal: false,
      upsert: true
    });
};

const merge_users = async (userPoolId, userAttributes, username) => {
  const input = {
    UserPoolId: userPoolId,
    Filter: `email = "${userAttributes.email}"`
  }
  const command = new ListUsersCommand(input);
  const response = await cognito.send(command);

  if (!_.isEmpty(response.Users) && (_.split(username, '_')[0] === 'Google' || _.split(username, '_')[0] === 'Facebook')) {
    const firstuser = _.sortBy(response.Users, (user) => new Date(user.UserCreateDate))[0];
    const input = {
      DestinationUser: {
        ProviderAttributeValue: _.split(firstuser.Username, '_')[1],
        ProviderName: _.split(firstuser.Username, '_')[0]
      },
      SourceUser: {
        ProviderAttributeName: 'Cognito_Subject',
        ProviderAttributeValue: _.split(username, '_')[1],
        ProviderName: _.split(username, '_')[0]
      },
      UserPoolId: userPoolId
    };
    const command = new AdminLinkProviderForUserCommand(input);
    await cognito.send(command);

    await update_user(_.find(firstuser.Attributes, (attr) => attr.Name === 'email').Value,
      {
        $addToSet: {
          authProviders: _.split(username, '_')[0]
        }
      });
  }
};

const postConfirmationHanlder = async (event) => {
  const userPoolId = event.userPoolId
  const userAttributes = event.request.userAttributes;
  const username = event.userName;
  const provider = _.split(username, '_')[0];
  const email = event.request.userAttributes.email;
  let picture = _.get(userAttributes, 'picture', '');

  try {
    if (provider === 'Facebook') {
      picture = JSON.parse(picture).data.url;
    }
  } catch (e) {
    console.error('Unable to extract Facebook picture', e);
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
  const result = await update_user(email, update);
  const uid = result.lastErrorObject.updatedExisting ? result.value._id.toString() : result.lastErrorObject.upserted.toString();
  const attributeUpdate = {
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: [
      {
        Name: "custom:uid",
        Value: uid,
      }
    ]
  };
  const command = new AdminUpdateUserAttributesCommand(attributeUpdate);
  await cognito.send(command);

  return event;
};

const preSignUpHandler = async (event) => {
  const userPoolId = event.userPoolId
  const userAttributes = event.request.userAttributes;
  const username = event.userName;

  await merge_users(userPoolId, userAttributes, username)

  event.response.autoConfirmUser = true
  event.response.autoVerifyEmail = true
  event.response.autoVerifyPhone = true

  return event;
};


export const main = async (event, context) => {
  console.log("EVENT: ", event);
  context.callbackWaitsForEmptyEventLoop = false;

  const eventType = event.triggerSource
  let response = null;

  switch (eventType) {
    case 'PostConfirmation_ConfirmSignUp':
      response = await postConfirmationHanlder(event);
      break;
    case 'PreSignUp_ExternalProvider':
      response = await preSignUpHandler(event);
      break;
    default:
      response = event;
      break;
  }

  console.log("RESPONSE: ", response);

  return response;
};
