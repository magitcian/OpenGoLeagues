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
                //console.log(response.data.listOfPlayers);
                setListOfPlayers(response.data.listOfPlayers);
            });
    }, []);

    const status = (status) => {
        //console.log(status);
        let text = "register";
        if (status === 2) {
            text = "waiting for validation";
        } else if (status === 3) {
            text = "refused";
        }
        return text;
    }

    const register = (leagueId, userId) => {
        axios
            .put(
                url + `Subscribe/manager-register/`,
                {
                    LeagueId: leagueId,
                    UserId: userId,
                },
                { headers: { accessToken: localStorage.getItem("accessToken") } },
            )
            .then((response) => {
                let sub = listOfPlayers.find(s=> s.PlayerUserId == userId && s.LeagueId == leagueId);
                sub.Status = 1;
                setListOfPlayers([...listOfPlayers]);
            });
    }

    const refused = (leagueId, userId) => {
        axios
            .put(
                url + `Subscribe/manager-refused`,
                {
                    LeagueId: leagueId,
                    UserId: userId,
                },
                { headers: { accessToken: localStorage.getItem("accessToken") } },
            )
            .then((response) => {
                let sub = listOfPlayers.find(s=> s.PlayerUserId == userId && s.LeagueId == leagueId);
                sub.Status = 3;
                setListOfPlayers([...listOfPlayers]);
            });
    }

    return (
        <div className="FirstTab">
            {listOfPlayers.map((sub, key) => {
                return (
                    <div key={key} className="player">
                        <p>{sub.Player.User.firstName} {sub.Player.User.lastName} - {status(sub.Status)}</p>
                        <div>
                            {sub.Status !== 1 && (
                                <button onClick={() => {register(sub.LeagueId, sub.PlayerUserId);}}>Register</button>
                            )}
                            {sub.Status !== 3 && (
                                <button onClick={() => {refused(sub.LeagueId, sub.PlayerUserId);}}>Refused</button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export default PlayerList;