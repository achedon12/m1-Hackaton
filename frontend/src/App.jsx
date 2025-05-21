import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout, Login, Profile, Register, Rdv, Home } from "./pages";
import { AuthProvider } from "./providers/AuthProvider.jsx";
import { ProtectedRoute } from "./components/index.js";

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />

                    <Route path="profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="rdv" element={
                        <ProtectedRoute>
                            <Rdv />
                        </ProtectedRoute>
                    } />
                </Route>
            </Routes>
        </AuthProvider>
    </BrowserRouter>
);

export default App;
