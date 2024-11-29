
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_OPmUKaybN',
    userPoolWebClientId: '62rbt4bbiai2ifpir22rh8jh1g',
  },
});
