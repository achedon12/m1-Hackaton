import { useState } from "react";

const Register = () => {
    const [activeTab, setActiveTab] = useState("person");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstname: "",
        lastname: "",
        phone: "",
        zipcode: "",
        city: "",
        gender: "",
        societyName: null,
        birth: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === "person") {
            console.log("Données Personne :", {
                firstname: formData.firstname,
                lastname: formData.lastname,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                zipcode: formData.zipcode,
                city: formData.city,
                gender: formData.gender,
                birth: formData.birth,
            });
        } else {
            console.log("Données Entreprise :", {
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                zipcode: formData.zipcode,
                city: formData.city,
                societyName: formData.societyName,
            });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
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
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input input-bordered w-full mb-4"
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input input-bordered w-full mb-4"
                />

                {activeTab === "person" && (
                    <>
                        <input
                            type="text"
                            placeholder="Prénom"
                            value={formData.firstname}
                            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            value={formData.lastname}
                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Téléphone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Code postal"
                            value={formData.zipcode}
                            onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Ville"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="date"
                            placeholder="Date de naissance"
                            value={formData.birth}
                            onChange={(e) => setFormData({ ...formData, birth: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                    </>
                )}

                {activeTab === "company" && (
                    <>
                        <input
                            type="text"
                            placeholder="Téléphone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Code postal"
                            value={formData.zipcode}
                            onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Ville"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                        <input
                            type="text"
                            placeholder="Nom de l'entreprise"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="input input-bordered w-full mb-4"
                        />
                    </>
                )}

                <button type="submit" className="btn btn-primary w-full">S'inscrire</button>
            </form>
        </div>
    );
};

export default Register;