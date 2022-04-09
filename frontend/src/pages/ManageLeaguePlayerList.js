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
        let text = "Registered";
        if (status === 2) {
            text = "Waiting for validation";
        } else if (status === 3) {
            text = "Refused";
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
                let sub = listOfPlayers.find(s => s.PlayerUserId == userId && s.LeagueId == leagueId);
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
                let sub = listOfPlayers.find(s => s.PlayerUserId == userId && s.LeagueId == leagueId);
                sub.Status = 3;
                setListOfPlayers([...listOfPlayers]);
            });
    }

    return (
        <div >
            <table className='playerList'>
                <thead>
                    <tr>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Level</th>
                        <th>Registration status</th>
                        <th>Change registration status</th>
                    </tr>
                </thead>
                {listOfPlayers.map((sub, key) => {
                    return (
                        <tbody key={key}>
                            <tr>
                                <td>{sub.Player.User.firstName}</td>
                                <td>{sub.Player.User.lastName}</td>
                                <td>{sub.Player.Level.level}</td>
                                <td className={status(sub.Status)}>{status(sub.Status)}</td>
                                <td>
                                    <div>
                                        {sub.Status !== 1 && (
                                            <button className='register' onClick={() => { register(sub.LeagueId, sub.PlayerUserId); }}>Register</button>
                                        )}
                                        {sub.Status !== 3 && (
                                            <button className='refused' onClick={() => { refused(sub.LeagueId, sub.PlayerUserId); }}>Refused</button>
                                        )}
                                    </div></td>
                            </tr>
                        </tbody>
                    );
                })}
            </table>
        </div>
    );
};
export default PlayerList;