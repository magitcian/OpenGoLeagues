import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";
import Select from 'react-select'
import { url } from "../helpers/URLContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DeleteIcon from "@material-ui/icons/Delete";
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import ReactTooltip from 'react-tooltip';

function CheatAnalysis() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();
  const [listOfAnalyzedSGFfile, setListOfAnalyzedSGFfile] = useState([]);
  const [blackLevelValue, setBlackLevelValue] = useState("");
  const [whiteLevelValue, setWhiteLevelValue] = useState("");
  const [visits, setVisits] = useState("");
  const [isDisabled, setDisabled] = useState(false);

  let levelOptions = [{ value: -20, label: "20k" }, { value: -15, label: '15k' }, { value: -10, label: '10k' }, { value: -5, label: '5k' },
  { value: -4, label: '4k' }, { value: -3, label: '3k' }, { value: -2, label: '2k' }, { value: -1, label: '1k' }, { value: 0, label: '1d' },
  { value: 1, label: '2d' }, { value: 2, label: '3d' }, { value: 3, label: '4d' }, { value: 4, label: '5d' }, { value: 5, label: '6d' },
  { value: 6, label: '7d' }, { value: 7, label: '8d' }, { value: 8, label: '9d' }]
  let visitsOptions = [{ value: 100, label: "100" }, { value: 500, label: '500' }, { value: 1000, label: '1000' }]
  const initialValues = {
    file: "",
    blackLevelValue: blackLevelValue,
    whiteLevelValue: whiteLevelValue,
    visits: visits,
  };

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {
      axios
        .get(url + "analyzedGame/my-analyzed-games", {
          headers: { accessToken: localStorage.getItem("accessToken") },
        })
        .then((response) => {
          console.log(response.data);
          setListOfAnalyzedSGFfile(response.data.listOfAnalyzedSGFfile);
          // if(!response.data.listOfAnalyzedSGFfile[0].Status){
          //   setDisabled(true);
          // }
        });
    }
  }, []);

  const validationSchema = Yup.object().shape({
    file: Yup.string().required("You must input a file!"),
    blackLevelValue: Yup.string().required("You must select a black level!"),
    whiteLevelValue: Yup.string().required("You must select a white level!"),
    visits: Yup.string().required("You must select a number of visits!"),
  });

  const [sgfFile, setSgfFile] = useState({ preview: '', data: '' })
  const [status, setStatus] = useState('')

  const uploadFile = (e) => {
    //console.log(blackLevel);
    if (blackLevelValue !== -1000 && whiteLevelValue !== -1000) {
      setDisabled(true);
      let formData = new FormData()
      formData.append('file', sgfFile.data)
      formData.append('blackLevelValue', blackLevelValue);
      formData.append('whiteLevelValue', whiteLevelValue);
      formData.append('visits', visits);
      fetch(url + 'sgfFile/upload', {
        method: 'POST',
        body: formData,
        headers: { accessToken: localStorage.getItem("accessToken") },
      }).then(response => response.json())
        .then(response => {
          //console.log(response);
          if (response.error === undefined) {
            console.log(response);
            console.log(response.AnalyzedSGFfile);
            setListOfAnalyzedSGFfile([response.AnalyzedSGFfile, ...listOfAnalyzedSGFfile]);
            axios
              .post(url + "leelaZero/analyzed",
                {
                  fileId: response.AnalyzedSGFfile.id,
                },
                {
                  headers: { accessToken: localStorage.getItem("accessToken") },
                },
              ).then((response) => {
                console.log(response.data);
                setListOfAnalyzedSGFfile([response.data.AnalyzedSGFfile, ...
                  listOfAnalyzedSGFfile.filter((game) => {
                    return game.id != response.data.AnalyzedSGFfile.id;
                  })
                ]);
                setDisabled(false);
              });
          } else {
            alert(response.error);
          }
        })
    } else {
      alert("Select black and white level again!");
    }
  }

  const handleFileChange = (e) => {
    const file = {
      preview: URL.createObjectURL(e.target.files[0]),
      data: e.target.files[0],
    }
    setSgfFile(file);

  }

  const downloadFile = (fileId, fileName) => {
    let formData = new FormData();
    formData.append('fileId', fileId);
    fetch(url + 'sgfFile/download', {
      method: 'POST',
      body: formData,
      headers: { accessToken: localStorage.getItem("accessToken") },
    })
      .then(response => {
        if (response.status == 200) {
          response.blob().then(blob => {
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
          });
        } else {
          response.json().then(o => alert(o.error))
        }
        //window.location.href = response.url;
      });
  }


  const deleteAnalysis = (fileId) => {
    axios
      .delete(url + `sgfFile/delete/${fileId}`,
        { headers: { accessToken: localStorage.getItem("accessToken") } },
      )
      .then((response) => {
        setListOfAnalyzedSGFfile(
          listOfAnalyzedSGFfile.filter((a) => {
            return a.id !== fileId;
          })
        );
        handleClose();
        // if (response.error === undefined) {
        // }
      });
  }

  const [open, setOpen] = React.useState(false);
  const [fileIdToDelete, setFileIdToDelete] = React.useState(0);

  const handleClickOpen = (fileId) => {
    setFileIdToDelete(fileId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className='App'>
      <h1>Upload a sgf file to server in order to analyze a game with Leela-Zero</h1>
      {/* {sgfFile.preview && <img src={sgfFile.preview} width='100' height='100' />} */}
      <hr></hr>
      <div className='analysisContainer'>
        <Formik
          initialValues={initialValues}
          onSubmit={uploadFile}
          validationSchema={validationSchema}

        >
          {({
            // errors,
            // handleBlur,
            // handleChange,
            // handleSubmit,
            // isSubmitting,
            // touched,
            // values,
            setFieldValue
          }) => (
            <Form className="formContainer">

              <label>Upload a file: </label>
              <ErrorMessage name="file" component="span" className='error' />
              <input type='file' name='file' onChange={(e) => { handleFileChange(e); setFieldValue("file", "new file") }}></input>

              <label>Select black level: </label>
              <ErrorMessage name="blackLevelValue" component="span" className='error' />
              <Select
                name="blackLevelValue"
                placeholder="Select black level"
                value={levelOptions.find(obj => obj.value === blackLevelValue)}
                options={levelOptions}
                //setFieldValue pour gérer les erreurs et setBlackLevel pour obtenir la valeur:
                onChange={(e) => { setFieldValue("blackLevelValue", e.value); setBlackLevelValue(e.value) }}
              />

              <label>Select white level: </label>
              <ErrorMessage name="whiteLevelValue" component="span" className='error' />
              <Select
                name="whiteLevelValue"
                placeholder="Select white level"
                value={levelOptions.find(obj => obj.value === whiteLevelValue)}
                options={levelOptions}
                onChange={(e) => { setFieldValue("whiteLevelValue", e.value); setWhiteLevelValue(e.value) }}
              />

              <label>Select number of visits (the depth of analysis): </label>
              <ErrorMessage name="visits" component="span" className='error' />
              <Select
                name="visits"
                placeholder="Select number of visits"
                value={visitsOptions.find(obj => obj.value === visits)}
                options={visitsOptions}
                onChange={(e) => { setFieldValue("visits", e.value); setVisits(e.value) }}
              />

              <button type="submit" disabled={isDisabled}>Send file to analyse</button>
            </Form>
          )}
        </Formik>
      </div>
      {status && <h4>{status}</h4>}

      <h1>Results</h1>
      <div className='analysisContainer'>
        <ReactTooltip />
        <table className='resultCheating'>
          <thead>
            <tr>
              <th>  </th>
              <th>File name</th>
              <th data-tip="This value represents the depth of analysis: 1000 is more accurate but takes around 15 minutes while 100 takes around 3 minutes.">Visits average</th>
              <th data-tip="The declared color of the players">Color</th>
              <th data-tip="The declared level of the players – this must be accurate in order to correctly assess if the player has cheated">Level</th>
              <th data-tip="The total number of move played which match exactly the first choice of the bot used to analyse the games (here Leelazero 0.17). Note that the analysis is performed only over the first 150 moves of the game.">1st move correspondances</th>
              <th data-tip="The total number of move played which match exactly the second choice of the bot used to analyse the games (here Leelazero 0.17). Note that the analysis is performed only over the first 150 moves of the game.">2nd move correspondances</th>
              <th data-tip="The total number of move played which doesn’t match exactly the best choices of the bot used to analyse the games (here Leelazero 0.17). Note that the analysis is performed only over the first 150 moves of the game.">Unexpected moves</th>
              <th data-tip="The total number of moves analyzed for each player. The sum of analyzed moves for the two players is 150.  Players can have a number of moves analyzed different from 75 due to handicap stones.">Total of moves</th>
              <th data-tip="This gives the percentage of 1st move correspondance with Leela-Zero 0.17. High values may be an indication a player cheated.">Rate moves 1</th>
              <th data-tip="This gives you the conclusion of the analyze about the possibility a player cheated. This is based on a wide statistical analysis and a player is declared to have cheated when his results are above the 99% confidence interval for his declared level.">Is cheating ?</th>

            </tr>
          </thead>

          {listOfAnalyzedSGFfile.map((asgf, key) => {
            return (
              <tbody key={key} className="res">
                {asgf.AnalyzedGames && asgf.AnalyzedGames.map((game, key) => {
                  return (
                    <tr key={key}>
                      {game.Color === "b" && (
                        <>
                          <td rowSpan="2" className="toDelete">
                            <div className="deleteButtons">
                              {asgf.Status && (
                                <DeleteIcon onClick={() => { handleClickOpen(asgf.id) }}
                                // onClick={() => {
                                //   deleteAnalysis(asgf.id);
                                // }}
                                />
                              )}
                            </div>
                          </td>
                          <td rowSpan="2" className="toLeft">
                            <span className="downloadFile" onClick={() => { downloadFile(asgf.id, asgf.SgfFileName) }}>{asgf.SgfFileName}</span>
                          </td>
                          <td rowSpan="2" >
                            <span>{asgf.VisitsAverage}</span>
                          </td>
                        </>
                      )}
                      <td >
                        {game.Color === "b" ? "Black" : "White"}
                      </td>
                      <td >
                        {levelOptions.find(o => o.value == game.LevelValue).label}
                      </td>
                      <td >
                        {!asgf.Status ? "pending analysis" : game["1stChoice"]}
                      </td>
                      <td>
                        {!asgf.Status ? "pending analysis" : game["2ndChoice"]}
                      </td>
                      <td>
                        {!asgf.Status ? "pending analysis" : game.UnexpectedMoves}
                      </td>
                      <td>
                        {!asgf.Status ? "pending analysis" : game.TotalAnalyzedMoves}
                      </td>
                      <td >
                        {!asgf.Status ? "pending analysis" : ((game["1stChoice"] / game.TotalAnalyzedMoves) * 100).toFixed(2)}
                      </td>
                      <td className={!asgf.Status ? "noValue" : game.IsCheating ? "yes" : "no"} >
                        {!asgf.Status ? "pending analysis" : game.IsCheating ? "yes" : "no"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}

        </table>
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          Deleting file and analysis
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action will delete the file and the analysis result on server. There is no way to recover after deleting.
            Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { deleteAnalysis(fileIdToDelete) }}>Yes</Button>
          <Button onClick={handleClose} autoFocus >No</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default CheatAnalysis;