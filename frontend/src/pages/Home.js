import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";


function Home() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {

    }
  }, []);

  return (
    <div className='App'>
      <h1>Welcome {authState.firstName} on Open Go Leagues !</h1>
      <div className="Paragraph">
        <p>This website provides you an environment where you can organize and manage Go leagues easily, register and participate 
          to leagues created by other peoples, but also allows you to analyze suspicious games in order to find if a player has cheated 
          in his games (for instance by using the help of a strong Go-bot while playing). You can discover and use this last feature in 
          the cheat analysis tab and you can find more information about the data and methodology in the Analysis and methodology tab. 
          Go to the other tabs to discovers the leagues and to create and manage your own league!</p>
      </div>
    </div>
  );
}

export default Home;
