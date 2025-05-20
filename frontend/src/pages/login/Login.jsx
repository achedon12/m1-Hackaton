import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(credentials.email, credentials.password);
        if (!localStorage.getItem("token")) {
            alert("Identifiants invalides");
            return;
        } else {
            navigate("/");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleSubmit} className="md:w-1/3 p-4 bg-white shadow-md rounded-3xl border border-gray-300">
                <h1 className="text-2xl mb-4">Se connecter</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="input input-bordered w-full mb-4"
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="input input-bordered w-full mb-4"
                />
                <button type="submit" className="btn btn-primary w-full">Se connecter</button>
                <div className="mt-4">
                    <p>
                        Pas encore de compte ?{" "}
                        <a href="/register" className="text-blue-500">S'inscrire</a>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;