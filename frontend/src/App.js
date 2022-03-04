import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";

import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
    const [authState, setAuthState] = useState({
        firstName: "",
        lastName: "",
        email: "",
        id: 0,
        status: false,
    });

    useEffect(() => {
        axios
            .get("http://localhost:3001/auth/auth", {
                headers: {
                    accessToken: localStorage.getItem("accessToken"),
                },
            })
            .then((response) => {
                console.log(response);
                if (response.data.error) {
                    setAuthState({ ...authState, status: false });
                } else {
                    setAuthState({
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        email: response.data.email,
                        id: response.data.id,
                        status: true,
                    });
                }
            });
    }, []);

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({ firstName: "",lastName: "",email: "", id: 0, status: false });
    };

    return (
        <div className="App">
            <AuthContext.Provider value={{ authState, setAuthState }}>
                <Router>
                    <div className="navbar">
                        <div className="links">
                            {!authState.status ? (
                                <>
                                    <Link to="/login"> Login</Link>
                                    <Link to="/registration"> Registration</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/"> Home Page</Link>
                                </>
                            )}
                        </div>
                        <div className="loggedInContainer">
                            <h1>{authState.firstName} </h1>
                            {authState.status && <button onClick={logout}> Logout</button>}
                        </div>
                    </div>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path='/registration' element={<Registration />} />
                        <Route path='/Login' element={<Login />} />
                        <Route path='*' element={<PageNotFound />} />
                    </Routes>
                </Router>
            </AuthContext.Provider>
        </div>
    );
}

export default App;