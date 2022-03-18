import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";
import Select from 'react-select'

function CheatAnalysis() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();
  const [listOfAnalyzedGame, setListOfAnalyzedGame] = useState([]);
  let blackLevel = 0;
  let whiteLevel = 0;
  let options = [ { value: -20, label: "20K" }, { value: -15, label: '15k' }, { value: -10, label: '10k' }, { value: -5, label: '5k' },
  { value: -4, label: '4k' }, { value: -3, label: '3k' }, { value: -2, label: '2k' }, { value: -1, label: '1k' }, { value: 0, label: '1d' },
  { value: 1, label: '2d' }, { value: 2, label: '3d' }, { value: 3, label: '4d' }, { value: 4, label: '5d' }, { value: 5, label: '6d' },
  { value: 6, label: '7d' }, { value: 7, label: '8d' }, { value: 8, label: '9d' }]

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
    formData.append('blackLevel', blackLevel);
    formData.append('whiteLevel', whiteLevel);
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

  // const handleSelectChange = (e) => {
  //   //this.setState({value: e.target.value});
  //   blackLevel = e.value;
  // }


  return (
    <div className='App'>
      <h1>Upload a sgf file to server in order to analyze a game with Leela-Zero</h1>
      {/* {sgfFile.preview && <img src={sgfFile.preview} width='100' height='100' />} */}
      <hr></hr>
      <form onSubmit={handleSubmit}>
        <input type='file' name='file' onChange={handleFileChange}></input>
        <br/><label>Black level: </label><Select options={options} onChange={(e) => {blackLevel = e.value}}/>
        <br/><label>White level: </label><Select options={options} onChange={(e) => {whiteLevel = e.value}}/>
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
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
            <th className="inv"></th>
          </tr>
          <tr>
            <th colSpan="1"></th>
            <th colSpan="7">Black</th>
            <th colSpan="7">White</th>
          </tr>
          <tr>
            <th>FileName</th>

            <th>Level</th>
            <th>1st choice</th>
            <th>2nd choice</th>
            <th>Unexpected</th>
            <th>TotMoves</th>
            <th>Rate moves 1</th>
            <th>Is cheating ?</th>

            <th>Level</th>
            <th>1st choice</th>
            <th>2nd choice</th>
            <th>Unexpected</th>
            <th>TotMoves</th>
            <th>Rate moves 1</th>
            <th>Is cheating ?</th>

          </tr>
        </thead>

        {listOfAnalyzedGame.map((value, key) => {
          return (
            <tbody key={key}>
              {value.BlackTotalAnalyzedMoves + value.WhiteTotalAnalyzedMoves == 0 ? (
                <tr >
                  <td className="toLeft">
                    {value.SgfFileName}
                  </td>
                  <td colSpan="14">
                    Analyze in progress! Waiting response from server.
                  </td>
                </tr>
              ) : (
                <tr>
                  <td className="toLeft">
                    {value.SgfFileName}
                  </td>
                  <td >
                    {value.BlackLevel}
                  </td>
                  <td >
                    {value.Black1stChoice}
                  </td>
                  <td>
                    {value.Black2ndChoice}
                  </td>
                  <td>
                    {value.BlackUnexpectedMoves}
                  </td>
                  <td>
                    {value.BlackTotalAnalyzedMoves}
                  </td>
                  <td >
                    {value.BlackMatchRateOfMoves1And2}
                  </td>
                  <td >
                    {value.IsBlackCheating ? "yes" : "no"}
                  </td>

                  <td >
                    {value.WhiteLevel}
                  </td>
                  <td >
                    {value.White1stChoice}
                  </td>
                  <td>
                    {value.White2ndChoice}
                  </td>
                  <td>
                    {value.WhiteUnexpectedMoves}
                  </td>
                  <td>
                    {value.WhiteTotalAnalyzedMoves}
                  </td>
                  <td >
                    {value.WhiteMatchRateOfMoves1And2}
                  </td>
                  <td >
                    {value.IsWhiteCheating ? "yes" : "no"}
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