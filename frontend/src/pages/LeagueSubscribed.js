import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { url } from "../helpers/URLContext";

function Home() {
  const [listOfSubscribes, setListOfSubscribes] = useState([]);
  //const [listOfManagers, setListOfManagers] = useState([]);
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios
        .get(url + "subscribe/subscribed-list", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          console.log(response.data.listOfSubscribes);
          //console.log(response.data.listOfManagers);
          setListOfSubscribes(response.data.listOfSubscribes);
          //setListOfManagers(response.data.listOfManagers);

        });
    }
  }, []);

  const unregister = (leagueId) => {
    axios
      .delete(
        url + `Subscribe/unregister/${leagueId}`,
        { headers: { accessToken: localStorage.getItem("accessToken") } },
      )
      .then((response) => {
        console.log(response.data);
        setListOfSubscribes(
          listOfSubscribes.filter((sub) => {
            return sub.LeagueId != leagueId;
          })
        );
      });
  }


  return (
    <div className='App'>
      <h1 className="leaguesTitle">Leagues where you are registered</h1>
      {listOfSubscribes.length == 0
        ? <p>You are not registered to any leagues!</p>
        : ""
      }
      {listOfSubscribes.map((value, key) => {
        return (
          <div key={key} className="league">
            <div className="title"> {value.League.name} </div>
            <div
              className="body"
            // onClick={() => {
            //   navigate(`/league/${value.League.id}`);
            // }}
            >
              {value.League.description}
            </div>
            <div className="footer">
              <div className="managerName">
                {/* <Link to={`/profile/${value.League.Manager.UserId}`}> {value.League.Manager.Player.User.firstName} {value.League.Manager.Player.User.lastName} </Link> */}
                {value.League.Manager.Player.User.firstName} {value.League.Manager.Player.User.lastName}
              </div>
              <div className="Register"
                onClick={() => {
                  unregister(value.LeagueId);
                }}>
                Unregister
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
