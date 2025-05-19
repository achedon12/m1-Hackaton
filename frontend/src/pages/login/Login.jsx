import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider";

const Login = () => {
    const { login } = useAuth();
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(credentials);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleSubmit} className="w-1/3 p-4 bg-white shadow-md rounded">
                <h1 className="text-2xl mb-4">Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="input input-bordered w-full mb-4"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="input input-bordered w-full mb-4"
                />
                <button type="submit" className="btn btn-primary w-full">Login</button>
            </form>
        </div>
    );
};

export default Login;