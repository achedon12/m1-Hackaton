import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Layout, Login, Profile} from "./pages";
import {ProtectedRoute} from "./components";

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/" element={<Layout/>}>
                {/*<Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>*/}
                <Route path="/profile" element={<Profile/>}/>
            </Route>
        </Routes>
    </BrowserRouter>
);

export default App;