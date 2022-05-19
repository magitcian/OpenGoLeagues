import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import Statgraph from '../Pictures/StatisticalAnalysisGraph.jpg';

function AnalysisMethodology() {
    const { authState } = useContext(AuthContext);
    let navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("accessToken")) {
            navigate("/login");
        } else {

        }
    }, []);

    return (
        <div className='App'>
            <h1>Methodology</h1>
            <div className="Paragraph">
                <p >The game you submit is analyzed according to the methodology presented below.</p>
                <p>Warning: a positive result for cheating analysis doesn’t mean the player has cheated, but that his result is suspicious (there is a 99.5% probability that his level is inaccurate: either he is under-ranked or he has cheated but keep in mind there is a 0.5% probability he just played super-well).</p>
                <p>It gives you the number of moves which perfectly match with Leela-Zero 1st choice, but also with second-choice and total unexpected moves. A cheater might cheat smartly and not following always bot top choice in order to avoid being catch. However, in that case he will still have a small number of unexpected moves. </p>
                <p>Currently, the cheating analysis is only based on the 1st move and the other values are displayed as an indication but are not (yet) taken into account in the final result. In you find any strange result, don’t hesitate to contact us for further information.</p>
            </div>
            <figure className="Statgraph">
                <img className="Statgraph" src={Statgraph} alt="Graph" />
                <figcaption>Figure 1 : Statistical analysis</figcaption>
            </figure>
            <div className="Paragraph">
                <p>This graph is the result of a preliminary statistical analysis showing the correlation between the strength (level value 0 = 1 dan) of the Go players (blue curve) based on about 2700 games played by amateurs on KGS server against top bot Petgo2 (using Katago). The confidence limit (orange curve) was calculated in order to contain 99% of the data.</p>
                <h2>Details:</h2>
                <p>Positions were analyzed at move 150 and gave the total number of moves which were top choices, mistakes, and unexpected moves from the beginning. From the distribution, linear tendency curve could be calculated and gives the blue equation, which links the strength of a player and the number of his moves which are expected to match top bot 1st choice. Furthermore, confidence hyperbole was calculated at a level of 99% certainty, meaning only 0.5% of the results are expected to be above the orange curve (the other 0.5% are expected to be below the distribution). From these calculations, any results above the orange equation for a given level is suspicious (equivalent to 8 stones stronger than the declared level) and reveal a possibility a player cheated using a top bot to assist him while playing. Multiple occurrences for a player would constitute a statistical anomaly and the player can be convicted of either cheating or having an inaccurate declared level. From our analysis, most of the points above the orange curve were found to be highly suspicious: either the rank of the players often evolved of many stones within a few days after the game was played or some very unlikely results were encountered such as a 1k player defeating Katago without handicap stones (this last player is assumed to have cheated). Only one counter-example was found for a 5d player slightly above the limit and thus could be among the 0.5 % wrongly suspected players.</p>
                <p>The results displayed above were reproduced by analyzing these games with Leela-Zero 0.17 with 40blocks best network weight file with an analysis depth of 1000 visits and running the analysis over the 150 first moves of the games. Similar correlations and equations were found using a set of around 350 games played by amateur vs amateur with slow time control (at least 20 sec per move) on KGS Server.</p>
            </div>
        </div>
    );
}

export default AnalysisMethodology;
