import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { url } from "../helpers/URLContext";

function Registration() {
  //const { url } = useContext(url);
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().min(3).max(15).required(),
    lastName: Yup.string().min(3).max(15).required(),
    email: Yup.string().min(3).max(15).required(),
    password: Yup.string().min(4).max(20).required(),
  });

  const onSubmit = (data) => {
    axios.post(url + "auth", data).then(() => {
      console.log(data);
    });
  };

  return (
    <div>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form className="formContainer">

          <label>Firstname: </label>
          <ErrorMessage name="fistName" component="span" />
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

          <button type="submit"> Register</button>
        </Form>
      </Formik>
    </div>
  );
}

export default Registration;
