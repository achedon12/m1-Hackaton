import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Layout, Login, Profile, Register, Rdv, Home, Meeting, Operations, TakeMeeting, Garages} from "./pages";
import {AuthProvider} from "./providers/AuthProvider.jsx";
import {ProtectedRoute, LocationProvider} from "./components";

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>

                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home/>}/>
                    <Route path={"operations"} element={<Operations/>}/>
                    <Route path={"garages"} element={<Garages/>}/>

                    <Route path="profile" element={
                        <ProtectedRoute>
                            <Profile/>
                        </ProtectedRoute>
                    }/>
                    <Route path="rdv" element={
                        <LocationProvider>
                            <ProtectedRoute>
                                <Rdv/>
                            </ProtectedRoute>
                        </LocationProvider>
                    }/>
                    <Route path="takeMeeting" element={
                        <ProtectedRoute>
                            <TakeMeeting/>
                        </ProtectedRoute>
                    }/>

                    <Route path="meeting" element={
                        <ProtectedRoute>
                            <Meeting/>
                        </ProtectedRoute>
                    }/>
                </Route>
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
