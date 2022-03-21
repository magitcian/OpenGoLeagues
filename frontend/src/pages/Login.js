import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate  } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { url } from "../helpers/URLContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useContext(AuthContext);
  let navigate = useNavigate();

  const login = () => {
    const data = { email: email, password: password };
    axios.post(url + "auth/login", data).then((response) => {
      if (response.data.error) {
        alert(response.data.error);
      } else {
        //sessionStorage.setItem("accessToken", response.data);
        localStorage.setItem("accessToken", response.data.token);
        console.log(response.data);
        setAuthState({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          id: response.data.id,
          status: true,
          isManager: response.data.isManager,
        });
        navigate("/");
      }
    });
  };
  return (
    <div className="loginContainer">
      <label>Email:</label>
      <input
        type="text"
        onChange={(event) => {
          setEmail(event.target.value);
        }}
      />
      <label>Password:</label>
      <input
        type="password"
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />

      <button onClick={login}> Login </button>
    </div>
  );
}

export default Login;
