import {useState} from "react";
import {Trash} from "lucide-react";
import config from "../../../providers/apiConfig.js";

const UserForm = () => {
    const client = JSON.parse(localStorage.getItem("client"));
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingBillingInformation, setIsEditingBillingInformation] = useState(false);
    const [formData, setFormData] = useState({
        email: client.email,
        firstname: client.firstname,
        lastname: client.lastname,
        phone: client.phone,
        zipcode: client.zipcode,
        city: client.city,
        gender: client.gender,
        societyName: client.societyName,
        birth: client.birth,
    });

    const handleUpdate = async (params) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/client/update`, {
                method: "PUT",
                headers: config.headers,
                body: JSON.stringify(params),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("client", JSON.stringify(data.client));
                alert("Utilisateur mis à jour avec succès !");
                setIsEditingEmail(false);
            } else {
                const error = await response.json();
                alert(`Erreur : ${error.error}`);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            alert("Une erreur est survenue.");
        }
    };

    return (
        <div className={"flex flex-col items-center justify-center w-full p-6 bg-base-200"}>
            <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Identifiants</legend>

                <label className="label w-1/3">Mon adresse mail</label>
                <div className="flex items-center">
                    {isEditingEmail ? (
                        <>
                            <input
                                type="email"
                                className="input flex-1"
                                value={client.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                            <button className="btn btn-primary ml-2" onClick={handleUpdate.bind(null, {email: formData.email})}>
                                Enregistrer
                            </button>
                            <button
                                className="btn btn-secondary ml-2"
                                onClick={() => {
                                    setFormData({...formData, email: client.email});
                                    setIsEditingEmail(false);
                                }}
                            >
                                Annuler
                            </button>
                        </>
                    ) : (
                        <>
                            <input type="email" className="input flex-1" value={client.email} disabled/>
                            <button
                                className="btn btn-secondary ml-2"
                                onClick={() => setIsEditingEmail(true)}
                            >
                                Modifier
                            </button>
                        </>
                    )}
                </div>
            </fieldset>

            <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Informations de facturation</legend>
                <p>
                    {client.lastname} {client.firstname}
                </p>
                <p>
                    {client.zipcode}, {client.city}
                </p>
                <p>{client.phone}</p>
                <button className="btn btn-secondary mt-4">Modifier</button>
            </fieldset>

            <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Supprimer mon compte</legend>
                <p>Voulez-vous définitivement supprimer votre compte ?</p>
                <div className="flex items-center justify-center">
                    <button className="btn btn-error mt-4">
                        <Trash className="mr-2"/>
                        <p>Supprimer mon compte</p>
                    </button>
                </div>
            </fieldset>
        </div>
    );
};

export default UserForm;