import { useState } from "react";
import { useAuth } from "../../providers/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const { register } = useAuth();
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
                if (!value) error = "Ce champ est requis.";
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
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });

        const hasErrors = Object.values({ ...errors, [name]: error }).some((err) => err);
        setIsFormValid(!hasErrors);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const registerForm = {...formData}
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
        <div className="flex flex-col items-center justify-center h-screen bg-secondary">
            <div className="flex justify-center p-2 mb-4 gap-4">
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
                    <p className={`${activeTab === "company" ? "text-white" : "text-secondary"}`}>🏢 Entreprise</p>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="md:w-1/3 p-4 bg-white shadow-md rounded-3xl border border-gray-300">
                <h1 className="text-2xl mb-4">
                    {activeTab === "person" ? "Créer un compte (Personne)" : "Créer un compte (Entreprise)"}
                </h1>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full mb-4"
                />
                {errors.email && <p className="text-red-500 text-sm mb-4">{errors.email}</p>}

                <input
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-bordered w-full mb-4"
                />
                {errors.password && <p className="text-red-500 text-sm mb-4">{errors.password}</p>}

                {activeTab === "person" && (
                    <>
                        <input
                            type="text"
                            name="firstname"
                            placeholder="Prénom"
                            value={formData.firstname}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            name="lastname"
                            placeholder="Nom"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            name="phone"
                            placeholder="Téléphone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mb-4">{errors.phone}</p>}
                        <input
                            type="text"
                            name="zipcode"
                            placeholder="Code postal"
                            value={formData.zipcode}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="Ville"
                            value={formData.city}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        {errors.city && <p className="text-red-500 text-sm mb-4">{errors.city}</p>}
                        <input
                            type="text"
                            name="gender"
                            placeholder="Genre"
                            value={formData.gender}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="date"
                            name="birth"
                            placeholder="Date de naissance"
                            value={formData.birth}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                    </>
                )}

                {activeTab === "company" && (
                    <>
                        <input
                            type="text"
                            name="phone"
                            placeholder="Téléphone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        {errors.phone && <p className="text-red-500 text-sm mb-4">{errors.phone}</p>}
                        <input
                            type="text"
                            name="zipcode"
                            placeholder="Code postal"
                            value={formData.zipcode}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="Ville"
                            value={formData.city}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            name="societyName"
                            placeholder="Nom de l'entreprise"
                            value={formData.societyName}
                            onChange={handleChange}
                            className="input input-bordered w-full mb-4"
                        />
                    </>
                )}

                <button type="submit" className={`btn btn-primary w-full ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!isFormValid}>
                    S'inscrire
                </button>
            </form>
        </div>
    );
};

export default Register;