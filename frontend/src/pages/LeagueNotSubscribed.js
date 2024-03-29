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
          setListOfLeaguesNotSub(response.data.listOfLeaguesNotSub);
          setListOfSubscribesStatus(response.data.listOfSubscribesStatus);
        });
    }
  }, []);

  const register = (leagueId) => {
    let sub = listOfSubscribesStatus.find(s => s.LeagueId == leagueId);
    if(!sub || sub.Status == 4){
    // if (!listOfSubscribesStatus.map(s => s.LeagueId).includes(leagueId)){
      axios.post(
        url + "subscribe/player-register",
        { LeagueId: leagueId },
        { headers: { accessToken: localStorage.getItem("accessToken") } }
      )
      .then((response) => {
        setListOfSubscribesStatus([...listOfSubscribesStatus, response.data]);
      });
    }else{
      alert(status(leagueId));
    }

  }

  const status = (leagueId) => {
    let text = "register";
    let sub = listOfSubscribesStatus.find(s => s.LeagueId == leagueId);
    if(sub){
      if(sub.Status == 2){
        text = "waiting for validation";
      }else if(sub.Status == 3){
        text = "refused";
      }
    }
    return text;
  }


  return (
    <div className='App'>
      <h1 className="leaguesTitle">Leagues where you are not registered</h1>
      <div className="Paragraph">
        <p>Check the list of the currently available leagues here! You can see what other peoples are doing and find leagues that might suit you! Register to them and play online tournaments!</p>
      </div>
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
                {/* <Link to={`/profile/${value.Manager.UserId}`}> {value.Manager.Player.User.firstName} {value.Manager.Player.User.lastName} </Link> */}
                {value.Manager.Player.User.firstName} {value.Manager.Player.User.lastName}
              </div>
              <div className="Register"
                onClick={() => {
                  register(value.id);
                }}>
                  { status(value.id) }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
