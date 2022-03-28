import React, { useContext } from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../helpers/AuthContext";
import { url } from "../../helpers/URLContext";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function ManageLeague2() {
    let { leagueId } = useParams();
    let navigate = useNavigate();
    const [key, setKey] = useState('home');

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        } else {

        }
    }, []);

    const CustomTab = ({ children, ...otherProps }) => (
        <Tab {...otherProps}>
          <h1>{children}</h1>
        </Tab>
        
      );

    return (
        <Tabs>
            <TabList>
                <Tab>Player list</Tab>
                <Tab>Manage tournement</Tab>
                <CustomTab>Custom Tab 1</CustomTab>
            </TabList>

            <TabPanel>
                <h2>Any content 1</h2>
            </TabPanel>
            <TabPanel>
                <h2>Any content 2</h2>
            </TabPanel>
            <TabPanel>
                <h2>Any content 2</h2>
            </TabPanel>
        </Tabs>
    );
}

export default ManageLeague2;
