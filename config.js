
const awsConfig = {
    region: 'us-east-1',
    userPoolId: '<Your-User-Pool-ID>',
    userPoolWebClientId: '<Your-App-Client-ID>',
};
Amplify.configure({ Auth: awsConfig });
