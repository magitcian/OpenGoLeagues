import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { useNavigate  } from "react-router-dom";
import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import LeagueSubscribed from "./pages/LeagueSubscribed";
import LeagueNotSubscribed from "./pages/LeagueNotSubscribed";
import CheatAnalysis from "./pages/CheatAnalysis";
import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
    let navigate = useNavigate();
    const [authState, setAuthState] = useState({
        firstName: "",
        lastName: "",
        email: "",
        id: 0,
        status: false,
        isManager: false,
    });
    

    useEffect(() => {
        axios
            .get("http://localhost:3001/auth/auth", {
                headers: {
                    accessToken: localStorage.getItem("accessToken"),
                },
            })
            .then((response) => {
                console.log(response.data);
                if (response.data.error) {
                    setAuthState({ ...authState, status: false });
                } else {
                    setAuthState({
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        email: response.data.email,
                        id: response.data.id,
                        status: true,
                        isManager: response.data.isManager,
                    });
                }
            });
    }, []);

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({ firstName: "", lastName: "", email: "", id: 0, status: false, isManager: false });
        navigate("/login");

    };

    return (
        <div className="App">
            <AuthContext.Provider value={{ authState, setAuthState }}>
                {/* <Router> */}
                    <div className="navbar">
                        <div className="links">
                            {!authState.status ? (
                                <>
                                    <Link to="/Login"> Login</Link>
                                    <Link to="/Registration"> Registration</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/"> Home</Link>
                                    <Link to="/LeagueSubscribed"> Your leagues</Link>
                                    <Link to="/LeagueNotSubscribed"> Other leagues</Link>
                                    <Link to="/CheatAnalysis"> Cheat analysis</Link>
                                </>
                            )}
                        </div>
                        <div className="loggedInContainer">
                            <h1>{authState.firstName} </h1>
                            {authState.status && <button onClick={logout}> Logout</button>}
                        </div>
                    </div>
                    <Routes>
                        {!authState.status ? (
                            <>
                                <Route path='/Login' element={<Login />} />
                                <Route path='/Registration' element={<Registration />} />
                            </>
                        ) : (
                            <>
                                <Route path="/" element={<Home />} />
                                <Route path="/LeagueSubscribed" element={<LeagueSubscribed />} />
                                <Route path="/LeagueNotSubscribed" element={<LeagueNotSubscribed />} />
                                <Route path="/CheatAnalysis" element={<CheatAnalysis />} />
                            </>
                        )}
                        <Route path='*' element={<PageNotFound />} />
                    </Routes>
                {/* </Router> */}
            </AuthContext.Provider>
        </div>
    );
}

export default App;