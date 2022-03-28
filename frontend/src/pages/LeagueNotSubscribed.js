import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { url } from "../helpers/URLContext";

function Home() {
  const [listOfLeaguesNotSub, setListOfLeaguesNotSub] = useState([]);
  const [listOfSubscribesStatus, setListOfSubscribesStatus] = useState([]);
  const { authState } = useContext(AuthContext);
  const status = ["register", "waiting for validation", "refused"];
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios
        .get(url + "subscribe/not-subscribed-list", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          console.log(response.data.listOfLeaguesNotSub);
          setListOfLeaguesNotSub(response.data.listOfLeaguesNotSub);
          setListOfSubscribesStatus(response.data.listOfSubscribesStatus);
        });
    }
  }, []);

  const register = (leagueId) => {
    //TODO : include ne fonctionne pas!
    if (!listOfSubscribesStatus.includes(s => s.LeagueId == leagueId)){
      axios.post(
        url + "Subscribe/register",
        { LeagueId: leagueId },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((response) => {
        console.log(response.data);
        setListOfLeaguesNotSub(
          listOfLeaguesNotSub.filter((l) => {
            return l.id != leagueId;
          })
        );
      });
    }else{
      alert("Registration not validate");
    }

  }


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
              <div className="Register"
                onClick={() => {
                  console.log(value.id);
                  register(value.id);
                }}>
                  {/* TODO : include ne fonctionne pas! */}
                  {/* { listOfSubscribesStatus.includes(s => s.LeagueId == value.id) ? (
                  "Register" ) : ("Registration not validate") } */}
                  Register
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
