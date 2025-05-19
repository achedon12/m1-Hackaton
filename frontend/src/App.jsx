import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Layout, Login, Profile, Register, Rdv} from "./pages";
import {ProtectedRoute} from "./components";

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/" element={<Layout/>}>
                {/*<Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>*/}
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/rdv" element={<Rdv/>}></Route>
            </Route>
        </Routes>
    </BrowserRouter>
);

export default App;