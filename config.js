import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_OPmUKqybN',
        userPoolWebClientId: '62rbt4bbiai2ifpir22rh8jh1g',
        mandatorySignIn: true,
        oauth: {
            domain: 'chatapp.auth.us-east-1.amazoncognito.com',
            scope: ['email', 'openid', 'profile'],
            redirectSignIn: 'https://main.d1uarapbmol90y.amplifyapp.com/home.html',
            redirectSignOut: 'https://main.d1uarapbmol90y.amplifyapp.com/index.html',
            responseType: 'code'
        }
    }
});
