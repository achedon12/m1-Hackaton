import {useState} from "react";
import {useAuth} from "../../providers/AuthProvider";
import {useNavigate} from "react-router-dom";
import {FormField} from "../../components";

const Login = () => {
    const {login} = useAuth();
    const [credentials, setCredentials] = useState({email: "", password: ""});
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateFields = () => {
        const newErrors = {};
        if (!credentials.email) newErrors.email = "L'email est requis.";
        if (!credentials.password) newErrors.password = "Le mot de passe est requis.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateFields()) return;

        await login(credentials.email, credentials.password);
        if (!localStorage.getItem("token")) {
            alert("Identifiants invalides");
        } else {
            navigate("/");
        }
    };

    return (
        <>
            <div className="absolute top-4 left-4">
                <a href="/" className="btn btn-white">Continuer en tant qu'invité</a>
            </div>
            <div className="flex flex-col items-center justify-center h-screen bg-secondary">
                <form onSubmit={handleSubmit}
                      className="md:w-1/3 p-4 bg-white shadow-md rounded-3xl border border-gray-300">
                    <h1 className="text-2xl mb-4">Se connecter</h1>
                    <FormField
                        label="Email"
                        type="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        error={errors.email}
                    />
                    <FormField
                        label="Mot de passe"
                        type="password"
                        placeholder="Mot de passe"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        error={errors.password}
                    />
                    <button type="submit" className="btn btn-primary w-full mt-8">Se connecter</button>
                </form>
                <div className="mt-4 flex flex-col items-center">
                    <p className={"text-white"}>
                        Pas encore de compte ?{" "}
                        <a href="/register" className="text-white underline">S'inscrire</a>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;