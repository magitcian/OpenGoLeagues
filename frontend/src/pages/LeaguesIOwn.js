import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { url } from "../helpers/URLContext";

function Home() {
  const [listOfLeagues, setListOfLeagues] = useState([]);
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios
        .get(url + "manager/own-leagues-list", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          console.log(response.data.listOfLeagues);
          setListOfLeagues(response.data.listOfLeagues);
        });
    }
  }, []);


  return (
    <div className='App'>
      <h1 className="leaguesTitle">Leagues where you are subscribed</h1>
      {listOfLeagues.length == 0
        ? <p>You don't have any leagues!</p>
        : ""
      }
      {listOfLeagues.map((value, key) => {
        return (
          <div key={key} className="league">
            <div className="title"> {value.name} </div>
            <div
              className="body"
              onClick={() => {
                navigate(`/ManageLeague/${value.id}`);
              }}
            >
              {value.description}
            </div>
            <div className="footer">
              <div className="managerName">
            
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Home;
