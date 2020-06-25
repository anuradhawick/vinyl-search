
const SES = require('aws-sdk').SES;

var ses = new SES({
    region: 'us-east-1'
});

var params = {
    Destination: {
     BccAddresses: [
     ], 
     CcAddresses: [
        // "recipient3@example.com"
     ], 
     ToAddresses: [
        "anuradhawick@gmail.com", 
        // "recipient2@example.com"
     ]
    }, 
    Message: {
     Body: {
      Html: {
       Charset: "UTF-8", 
       Data: "This message body contains HTML formatting. It can, for example, contain links like this one: <a class=\"ulink\" href=\"http://docs.aws.amazon.com/ses/latest/DeveloperGuide\" target=\"_blank\">Amazon SES Developer Guide</a>."
      }, 
      Text: {
       Charset: "UTF-8", 
       Data: "This is the message body in text format."
      }
     }, 
     Subject: {
      Charset: "UTF-8", 
      Data: "Test email"
     }
    }, 
    ReplyToAddresses: [
    ], 
    // ReturnPath: "", 
    // ReturnPathArn: "", 
    Source: "info@vinyl.lk", 
    SourceArn: "arn:aws:ses:us-east-1:894825156843:identity/info@vinyl.lk"
   };
   ses.sendEmail(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
     /*
     data = {
      MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
     }
     */
   });


const CognitoIdentityServiceProvider = require('aws-sdk').CognitoIdentityServiceProvider;
const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider({
    region: 'ap-southeast-1'
});

var params = {
    UserPoolId: 'ap-southeast-1_Z23imsu3V', /* required */
    Username: 'Facebook_10219144703678364', /* required */
    // region: 'ap-southeast-1'
  };
//   cognitoidentityserviceprovider.adminGetUser(params, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else     console.log(data);           // successful response
//   });