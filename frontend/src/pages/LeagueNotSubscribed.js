import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Home() {
  const [listOfLeaguesNotSub, setListOfLeaguesNotSub] = useState([]);
  //const [listOfManagers, setListOfManagers] = useState([]);
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios
        .get("http://localhost:3001/subscribe/not-subscribed-list", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          console.log(response.data.listOfLeaguesNotSub);
          //console.log(response.data.listOfManagers);
          setListOfLeaguesNotSub(response.data.listOfLeaguesNotSub);
          //setListOfManagers(response.data.listOfManagers);

        });
    }
  }, []);


  return (
    <div>
      <h1>Leagues where you are not subscribed</h1>
      {listOfLeaguesNotSub.map((value, key) => {
        return (
          <div key={key} className="league">
            <div className="title"> {value.name} </div>
            <div
              className="body"
            // onClick={() => {
            //   navigate(`/league/${value.League.id}`);
            // }}
            >
              {value.description}
            </div>
            <div className="footer">
              <div className="managerName">
                <Link to={`/profile/${value.Manager.UserId}`}> {value.Manager.Player.User.firstName} {value.Manager.Player.User.lastName} </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
