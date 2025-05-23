import {useState} from "react";
import {useAuth} from "../../providers/AuthProvider.jsx";
import {useNavigate} from "react-router-dom";
import FormField from "../../components/FormField.jsx";

const Register = () => {
    const {register} = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("person");
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstname: "",
        lastname: "",
        phone: "",
        zipcode: "",
        city: "",
        gender: "",
        societyName: "",
        birth: ""
    });

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "email":
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) error = "L'email est invalide.";
                break;
            case "password":
                if (value.length < 8) error = "Le mot de passe doit contenir au moins 8 caractères.";
                else if (!/[A-Z]/.test(value)) error = "Le mot de passe doit contenir au moins une majuscule.";
                else if (!/[0-9]/.test(value)) error = "Le mot de passe doit contenir au moins un chiffre.";
                else if (!/[\W_]/.test(value)) error = "Le mot de passe doit contenir au moins un caractère spécial.";
                break;
            case "birth":
                if (value && isNaN(Date.parse(value))) error = "La date de naissance est invalide.";
                break;
            case "phone":
            case "zipcode":
            case "city":
                if (!value) error = "Ce champ est requis.";
                break;
            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});

        const error = validateField(name, value);
        setErrors({...errors, [name]: error});

        const hasErrors = Object.values({...errors, [name]: error}).some((err) => err);
        setIsFormValid(!hasErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const registerForm = {...formData};
            await register(registerForm);
            if (localStorage.getItem("token")) {
                navigate("/");
            } else {
                alert("Erreur lors de l'enregistrement");
            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement :", error);
        }
    };

    return (
        <>
            <div className="absolute top-4 left-4">
                <a href="/" className="btn btn-white">Continuer en tant qu'invité</a>
            </div>
            <div className="flex flex-col items-center justify-center bg-secondary">
                <div className={`m-10 h-screen w-full md:w-1/3`}>
                    <div
                        className="flex justify-center p-2 mb-4 gap-4 bg-white rounded-xl border border-gray-300 w-2/3 mx-auto">
                        <button
                            className={`btn btn-ghost ${activeTab === "person" ? "bg-secondary" : "text-secondary"}`}
                            onClick={() => setActiveTab("person")}
                        >
                            <p className={`${activeTab === "person" ? "text-white" : "text-secondary"}`}>👤 Personne</p>
                        </button>
                        <button
                            className={`btn btn-ghost ${activeTab === "company" ? "bg-secondary" : "text-secondary"}`}
                            onClick={() => setActiveTab("company")}
                        >
                            <p className={`${activeTab === "company" ? "text-white" : "text-secondary"}`}>🏢
                                Entreprise</p>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}
                          className="w-full p-8 bg-white shadow-md rounded-3xl border border-gray-300 h-3/4 overflow-auto">
                        <h1 className="text-2xl mb-4">
                            {activeTab === "person" ? "Créer un compte (Personne)" : "Créer un compte (Entreprise)"}
                        </h1>

                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />
                        <FormField
                            label="Mot de passe"
                            name="password"
                            type="password"
                            placeholder="Mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />

                        {activeTab === "person" && (
                            <>
                                <FormField
                                    label="Prénom"
                                    name="firstname"
                                    type="text"
                                    placeholder="Prénom"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                />
                                <FormField
                                    label="Nom"
                                    name="lastname"
                                    type="text"
                                    placeholder="Nom"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                />
                                <FormField
                                    label="Téléphone"
                                    name="phone"
                                    type="text"
                                    placeholder="Téléphone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                />
                                <FormField
                                    label="Code postal"
                                    name="zipcode"
                                    type="text"
                                    placeholder="Code postal"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                />
                                <FormField
                                    label="Ville"
                                    name="city"
                                    type="text"
                                    placeholder="Ville"
                                    value={formData.city}
                                    onChange={handleChange}
                                    error={errors.city}
                                />
                                <FormField
                                    label="Genre"
                                    name="gender"
                                    type="text"
                                    placeholder="Genre"
                                    value={formData.gender}
                                    onChange={handleChange}
                                />
                                <FormField
                                    label="Date de naissance"
                                    name="birth"
                                    type="date"
                                    placeholder="Date de naissance"
                                    value={formData.birth}
                                    onChange={handleChange}
                                />
                            </>
                        )}

                        {activeTab === "company" && (
                            <>
                                <FormField
                                    label="Téléphone"
                                    name="phone"
                                    type="text"
                                    placeholder="Téléphone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                />
                                <FormField
                                    label="Code postal"
                                    name="zipcode"
                                    type="text"
                                    placeholder="Code postal"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                />
                                <FormField
                                    label="Ville"
                                    name="city"
                                    type="text"
                                    placeholder="Ville"
                                    value={formData.city}
                                    onChange={handleChange}
                                />
                                <FormField
                                    label="Nom de l'entreprise"
                                    name="societyName"
                                    type="text"
                                    placeholder="Nom de l'entreprise"
                                    value={formData.societyName}
                                    onChange={handleChange}
                                />
                            </>
                        )}

                        <button
                            type="submit"
                            className={`btn btn-primary w-full mt-8 ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={!isFormValid}
                        >
                            S'inscrire
                        </button>
                    </form>
                    <div className="mt-4 flex flex-col items-center">
                        <p className="text-white"> Déjà un compte ?{" "}
                            <a href="/login" className="text-white underline">Se connecter</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;