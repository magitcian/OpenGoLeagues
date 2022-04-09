import React, { useState, useContext } from "react";
import { AuthContext } from "../helpers/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { url } from "../helpers/URLContext";
import Select from 'react-select'
import { useNavigate  } from "react-router-dom";

function Registration() {
  const { setAuthState } = useContext(AuthContext);
  let navigate = useNavigate();
  //const { url } = useContext(url);
  let options = [{ value: -20, label: "20K" }, { value: -15, label: '15k' }, { value: -10, label: '10k' }, { value: -5, label: '5k' },
  { value: -4, label: '4k' }, { value: -3, label: '3k' }, { value: -2, label: '2k' }, { value: -1, label: '1k' }, { value: 0, label: '1d' },
  { value: 1, label: '2d' }, { value: 2, label: '3d' }, { value: 3, label: '4d' }, { value: 4, label: '5d' }, { value: 5, label: '6d' },
  { value: 6, label: '7d' }, { value: 7, label: '8d' }, { value: 8, label: '9d' }]
  let level = 0;

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    level: "",
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().min(3).max(15).required(),
    lastName: Yup.string().min(3).max(15).required(),
    email: Yup.string().min(3).max(15).required(),
    password: Yup.string().min(12).max(50).required(),
    passwordConfirmation: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match'),
    level: Yup.string().required("You must select a level!"),
  });

  const login = (email, password) => {
    const data = { email: email, password: password };
    axios.post(url + "auth/login", data).then((response) => {
      if (response.data.error) {
        alert(response.data.error);
      } else {
        //sessionStorage.setItem("accessToken", response.data);
        localStorage.setItem("accessToken", response.data.token);
        setAuthState({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          id: response.data.id,
          status: true,
          isManager: response.data.isManager,
        });
        navigate("/");
      }
    });
  };

  const onSubmit = (data) => {
    axios.post(url + "auth", data).then(() => {
      login(data.email, data.password);
    });
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        {({
          setFieldValue
        }) => (
          <Form className="formContainer">

            <label>Firstname: </label>
            <ErrorMessage name="firstName" component="span" />
            <Field
              autoComplete="off"
              className="inputCreatePost"
              name="firstName"
              placeholder="(Ex. John)"
            />

            <label>Lastname: </label>
            <ErrorMessage name="lastName" component="span" />
            <Field
              autoComplete="off"
              className="inputCreatePost"
              name="lastName"
              placeholder="(Ex. Smith)"
            />

            <label>Email: </label>
            <ErrorMessage name="email" component="span" />
            <Field
              autoComplete="off"
              className="inputCreatePost"
              name="email"
              placeholder="(Ex. john@epfc.eu)"
            />

            <label>Password: </label>
            <ErrorMessage name="password" component="span" />
            <Field
              autoComplete="off"
              type="password"
              className="inputCreatePost"
              name="password"
              placeholder="Your Password..."
            />

            <label>Rewrite password: </label>
            <ErrorMessage name="passwordConfirmation" component="span" />
            <Field
              autoComplete="off"
              type="password"
              className="inputCreatePost"
              name="passwordConfirmation"
              placeholder="Your Password..."
            />

            <label>Your level: </label>
            <ErrorMessage name="level" component="span" />
            <Select name="level" options={options} onChange={(e) => { level = e.value; setFieldValue("level", e.value) }} />

            <button type="submit"> Register</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Registration;
