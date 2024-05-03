const OAuthApp = require('octokit/oauth-app');

const instagram = new OAuthApp({
  clientId: '1430400461175170',
  clientSecret: '4edf26a4832eac9dd9d599a0',
  redirectUri: 'freefuzxcoj.com'
});

const authorizationUrl = instagram.authorizationUrl({
  scope: 'user_profile'
});

console.log(authorizationUrl);