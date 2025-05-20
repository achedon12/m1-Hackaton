import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Layout, Login, Profile, Register, Rdv} from "./pages";
import {AuthProvider} from "./providers/AuthProvider.jsx";

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/" element={<Layout/>}>
                    <Route path="/profile" element={<Profile/>}/>
                    <Route path="/rdv" element={<Rdv/>}></Route>
                </Route>
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default App;