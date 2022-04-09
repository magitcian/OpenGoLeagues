import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import { url } from "../helpers/URLContext";
import 'react-dyn-tabs/style/react-dyn-tabs.css';
import 'react-dyn-tabs/themes/react-dyn-tabs-card.css';
import useDynTabs from 'react-dyn-tabs';
import PlayerList from "./ManageLeaguePlayerList";

function ManageLeague() {
    let { leagueId } = useParams();
    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        } else {

        }
    }, []);

    const options = {
        tabs: [
            {
                id: '1',
                title: 'Player list',
                panelComponent: (porps) => PlayerList(leagueId),
                closable: false,
            },
            {
                id: '2',
                title: 'Tournament list',
                panelComponent: (porps) => <p> Tournament list in development </p>,
                closable: false,
            },
        ],
        selectedTabID: '1',
    };
    let _instance;
    const [TabList, PanelList, ready] = useDynTabs(options);
    ready((instance) => {
        _instance = instance;
    });
    const addTab3 = function () {
        // open tab 3
        _instance.open({ id: '3', title: 'Tab 3', panelComponent: (porps) => <p> panel 3 </p> }).then(() => {
            console.log('tab 3 is open');
        });
        // switch to tab 3
        _instance.select('3').then(() => {
            console.log('tab 3 is selected');
        });
    };

    return (
        <>
            <div className='App'>
                {/* Pour plus tard, ajout d'onglets dès qu'on clique sur un tournoi: */}
                {/* <button onClick={addTab3}>Add tab 3</button> */}
                <TabList></TabList>
                <PanelList></PanelList>
            </div>
        </>
    );
}

export default ManageLeague;