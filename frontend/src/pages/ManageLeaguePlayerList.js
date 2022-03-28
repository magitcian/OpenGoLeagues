import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { url } from "../helpers/URLContext";

function PlayerList(leagueId) {
    let navigate = useNavigate();
    const [listOfPlayers, setListOfPlayers] = useState([]);

    useEffect(() => {
        axios
            .get(url + `subscribe/player-list/${leagueId}`, {
                headers: { accessToken: localStorage.getItem("accessToken") },
            })
            .then((response) => {
                console.log(response.data.listOfPlayers);
                setListOfPlayers(response.data.listOfPlayers);
            });
    }, []);


    return (
        <div className="FirstTab">
            {listOfPlayers.map((sub, key) => {
                return (
                    <div key={key} className="player">
                        <p>{sub.Player.User.firstName} {sub.Player.User.lastName}</p>
                    </div>
                );
            })}
        </div>
    );
};
export default PlayerList;