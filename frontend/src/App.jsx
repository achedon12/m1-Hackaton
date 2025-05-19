import {BrowserRouter, Routes, Route} from "react-router-dom";
import {Layout} from "./pages";
const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout/>}>
            </Route>
        </Routes>
    </BrowserRouter>
);

export default App;