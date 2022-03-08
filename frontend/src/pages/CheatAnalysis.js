import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function CheatAnalysis() {
  const { authState } = useContext(AuthContext);
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
    } else {

    }
  }, []);

  const [image, setImage] = useState({ preview: '', data: '' })
  const [status, setStatus] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()
    let formData = new FormData()
    formData.append('file', image.data)
    const response = await fetch('http://localhost:3001/SGFfile/upload', {
      method: 'POST',
      body: formData,
    })
    if (response) setStatus(response.statusText)
  }

  const handleFileChange = (e) => {
    const img = {
      preview: URL.createObjectURL(e.target.files[0]),
      data: e.target.files[0],
    }
    setImage(img)
  }


  return (
    <div className='App'>
      <h1>Upload to server</h1>
      {image.preview && <img src={image.preview} width='100' height='100' />}
      <hr></hr>
      <form onSubmit={handleSubmit}>
        <input type='file' name='file' onChange={handleFileChange}></input>
        <button type='submit'>Submit</button>
      </form>
      {status && <h4>{status}</h4>}
    </div>
  );
}

export default CheatAnalysis;