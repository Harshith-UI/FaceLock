
import React, { useState } from "react";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { awsConfig } from "../aws-config";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const poolData = {
    UserPoolId: awsConfig.userPoolId,
    ClientId: awsConfig.userPoolWebClientId,
  };
  const userPool = new CognitoUserPool(poolData);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = userPool.getCurrentUser();
    if (user) {
      console.log("User already logged in:", user.getUsername());
    } else {
      console.log("No user currently logged in.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
