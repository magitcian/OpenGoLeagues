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

function CheatAnalysis() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();
  const [listOfAnalyzedGame, setListOfAnalyzedGame] = useState([]);
  const [blackLevel, setBlackLevel] = useState("");
  const [whiteLevel, setWhiteLevel] = useState("");
  const [visits, setVisits] = useState("");

  let levelOptions = [{ value: -20, label: "20K" }, { value: -15, label: '15k' }, { value: -10, label: '10k' }, { value: -5, label: '5k' },
  { value: -4, label: '4k' }, { value: -3, label: '3k' }, { value: -2, label: '2k' }, { value: -1, label: '1k' }, { value: 0, label: '1d' },
  { value: 1, label: '2d' }, { value: 2, label: '3d' }, { value: 3, label: '4d' }, { value: 4, label: '5d' }, { value: 5, label: '6d' },
  { value: 6, label: '7d' }, { value: 7, label: '8d' }, { value: 8, label: '9d' }]
  let visitsOptions = [{ value: 100, label: "100" }, { value: 500, label: '500' }, { value: 1000, label: '1000' }]
  const initialValues = {
    file: "",
    blackLevel: blackLevel,
    whiteLevel: whiteLevel,
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
          //console.log(response.data);
          setListOfAnalyzedGame(response.data.listOfAnalyzedGame);
        });
    }
  }, []);

  const validationSchema = Yup.object().shape({
    file: Yup.string().required("You must input a file!"),
    blackLevel: Yup.string().required("You must select a black level!"),
    whiteLevel: Yup.string().required("You must select a white level!"),
    visits: Yup.string().required("You must select a number of visits!"),
  });

  const [sgfFile, setSgfFile] = useState({ preview: '', data: '' })
  const [status, setStatus] = useState('')

  const uploadFile = (e) => {
    //console.log(blackLevel);
    if (blackLevel !== -1000 && whiteLevel !== -1000) {
      let formData = new FormData()
      formData.append('file', sgfFile.data)
      formData.append('blackLevel', blackLevel);
      formData.append('whiteLevel', whiteLevel);
      formData.append('visits', visits);
      fetch(url + 'sgfFile/upload', {
        method: 'POST',
        body: formData,
        headers: { accessToken: localStorage.getItem("accessToken") },
      }).then(response => response.json())
        .then(response => {
          //console.log(response);
          if (response.error === undefined) {
            setListOfAnalyzedGame([response.analyzedGame, ...listOfAnalyzedGame]);
            axios
              .post(url + "leelaZero/analyzed",
                {
                  fileId: response.analyzedGame.id,
                },
                {
                  headers: { accessToken: localStorage.getItem("accessToken") },
                },
              ).then((response) => {
                //console.log(response.data);
                setListOfAnalyzedGame([response.data.AnalyzedGame, ...
                  listOfAnalyzedGame.filter((game) => {
                    return game.id != response.data.AnalyzedGame.id;
                  })
                ]);
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
        setListOfAnalyzedGame(
          listOfAnalyzedGame.filter((a) => {
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
      <div className='createPage'>
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
              <ErrorMessage name="blackLevel" component="span" className='error' />
              <Select
                name="blackLevel"
                placeholder="Select black level"
                value={levelOptions.find(obj => obj.value === blackLevel)} 
                options={levelOptions} 
                //setFieldValue pour gérer les erreurs et setBlackLevel pour obtenir la valeur:
                onChange={(e) => { setFieldValue("blackLevel", e.value); setBlackLevel(e.value) }}
              />

              <label>Select white level: </label>
              <ErrorMessage name="whiteLevel" component="span" className='error' />
              <Select
                name="whiteLevel"
                placeholder="Select white level"
                value={levelOptions.find(obj => obj.value === whiteLevel)} 
                options={levelOptions} 
                onChange={(e) => { setFieldValue("whiteLevel", e.value); setWhiteLevel(e.value) }}
              />

              <label>Select number of visits: </label>
              <ErrorMessage name="visits" component="span" className='error' />
              <Select
                name="visits"
                placeholder="Select number of visits"
                value={visitsOptions.find(obj => obj.value === visits)} 
                options={visitsOptions} 
                onChange={(e) => { setFieldValue("visits", e.value); setVisits(e.value) }} 
              />

              <button type="submit">Send file to analyse</button>
            </Form>
          )}
        </Formik>
      </div>
      {status && <h4>{status}</h4>}

      <h1>Results</h1>

      <table className='resultCheating'>
        <thead>
          <tr>
            <th></th>
            <th>FileName</th>
            <th>Visits average</th>
            <th>Color</th>
            <th>Level</th>
            <th>1st move correspondances</th>
            <th>2nd move correspondances</th>
            <th>Unexpected moves</th>
            <th>Total of moves</th>
            <th>Rate moves 1</th>
            <th>Is cheating ?</th>

          </tr>
        </thead>

        {listOfAnalyzedGame.map((value, key) => {
          return (
            <tbody key={key} className="res">
              <tr>
                <td rowSpan="2" className="toDelete">
                  <div className="deleteButtons">
                    {value.Status && (
                      <DeleteIcon onClick={() => { handleClickOpen(value.id) }}
                      // onClick={() => {
                      //   deleteAnalysis(value.id);
                      // }}
                      />
                    )}
                  </div>
                </td>
                <td rowSpan="2" className="toLeft">
                  <span className="downloadFile" onClick={() => { downloadFile(value.id, value.SgfFileName) }}>{value.SgfFileName}</span>
                </td>
                <td rowSpan="2" >
                  <span>{value.VisitsAverage}</span>
                </td>

                <td >
                  Black
                </td>
                <td >
                  {levelOptions.find(o => o.value == value.BlackLevel).label}
                </td>
                <td >
                  {!value.Status ? "pending analysis" : value.Black1stChoice}
                </td>
                <td>
                  {!value.Status ? "pending analysis" : value.Black2ndChoice}
                </td>
                <td>
                  {!value.Status ? "pending analysis" : value.BlackUnexpectedMoves}
                </td>
                <td>
                  {!value.Status ? "pending analysis" : value.BlackTotalAnalyzedMoves}
                </td>
                <td >
                  {!value.Status ? "pending analysis" : value.BlackMatchRateOfMoves1And2}
                </td>
                <td className={!value.Status ? "noValue" : value.IsBlackCheating ? "yes" : "no"} >
                  {!value.Status ? "pending analysis" : value.IsBlackCheating ? "yes" : "no"}
                </td>
              </tr>
              <tr>
                <td >
                  White
                </td>
                <td >
                  {levelOptions.find(o => o.value == value.WhiteLevel).label}
                </td>
                <td >
                  {!value.Status ? "pending analysis" : value.White1stChoice}
                </td>
                <td>
                  {!value.Status ? "pending analysis" : value.White2ndChoice}
                </td>
                <td>
                  {!value.Status ? "pending analysis" : value.WhiteUnexpectedMoves}
                </td>
                <td>
                  {!value.Status ? "pending analysis" : value.WhiteTotalAnalyzedMoves}
                </td>
                <td >
                  {!value.Status ? "pending analysis" : value.WhiteMatchRateOfMoves1And2}
                </td>
                <td className={!value.Status ? "noValue" : value.IsWhiteCheating ? "yes" : "no"}>
                  {!value.Status ? "pending analysis" : value.IsWhiteCheating ? "yes" : "no"}
                </td>
              </tr>
            </tbody>

          );
        })}

      </table>

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