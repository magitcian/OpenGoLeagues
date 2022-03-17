import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";

function CheatAnalysis() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();
  const [listOfAnalyzedGame, setListOfAnalyzedGame] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {

      axios
        .get("http://localhost:3001/AnalyzedGame/my-analyzed-games", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          console.log(response.data.listOfAnalyzedGame);
          setListOfAnalyzedGame(response.data.listOfAnalyzedGame);

        });
    }
  }, []);

  const [sgfFile, setSgfFile] = useState({ preview: '', data: '' })
  const [status, setStatus] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    let formData = new FormData()
    formData.append('file', sgfFile.data)
    fetch('http://localhost:3001/SGFfile/upload', {
      method: 'POST',
      body: formData,
      headers: { accessToken: localStorage.getItem("accessToken") },
    }).then(response => response.json())
      .then(response => {
        //console.log(response.analyzedGame)
        setListOfAnalyzedGame([...listOfAnalyzedGame, response.analyzedGame]);
        axios
          .post("http://localhost:3001/LeelaZero/analyzed",
            {
              fileId: response.analyzedGame.id,
            },
            {
              headers: { accessToken: localStorage.getItem("accessToken") },
            },
          ).then((response) => {
            console.log(response.data);
          });
      })
    // if (response){
    //   setStatus(response.statusText);
    //   console.log(response.json());
    // } 

  }

  const handleFileChange = (e) => {
    const img = {
      preview: URL.createObjectURL(e.target.files[0]),
      data: e.target.files[0],
    }
    setSgfFile(img)
  }


  return (
    <div className='App'>
      <h1>Upload a sgf file to server in order to analyze a game with Leela-Zero</h1>
      {/* {sgfFile.preview && <img src={sgfFile.preview} width='100' height='100' />} */}
      <hr></hr>
      <form onSubmit={handleSubmit}>
        <input type='file' name='file' onChange={handleFileChange}></input>
        <button type='submit'>Submit</button>
      </form>
      {status && <h4>{status}</h4>}
      <table>
        <thead>
          <tr className="inv">
            <th className="inv" ></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
          </tr>
          <tr>
            <th colSpan="1"></th>
            <th colSpan="4">Black</th>
            <th colSpan="4">White</th>
          </tr>
          <tr>
            <th>FileName</th>
            <th>1st choice</th>
            <th>2nd choice</th>
            <th>Unexpected</th>
            <th>TotMoves</th>
            <th>1st choice</th>
            <th>2nd choice</th>
            <th>Unexpected</th>
            <th>TotMoves</th>
          </tr>
        </thead>

        {listOfAnalyzedGame.map((value, key) => {
          return (
            <tbody key={key}>
              {value.TotalAnalyzedMovesBlack + value.TotalAnalyzedMovesWhite == 0 ? (
                <tr >
                  <td className="toLeft">
                    {value.SgfFileName}
                  </td>
                  <td colSpan="8">
                    Analyze in progress! Waiting response from server.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="toLeft">
                    {value.SgfFileName}
                  </td>
                  <td >
                    {value.CorrespNumOfMoves1Black}
                  </td>
                  <td>
                    {value.CorrespNumOfMoves2Black}
                  </td>
                  <td>
                    {value.UnexpectedMovesBlack}
                  </td>
                  <td>
                    {value.TotalAnalyzedMovesBlack}
                  </td>
                  <td >
                    {value.CorrespNumOfMoves1White}
                  </td>
                  <td>
                    {value.CorrespNumOfMoves2White}
                  </td>
                  <td>
                    {value.UnexpectedMovesWhite}
                  </td>
                  <td>
                    {value.TotalAnalyzedMovesWhite}
                  </td>
                </tr>
              )
              }
            </tbody>

          );
        })}

      </table>
    </div>
  );
}

export default CheatAnalysis;