import {useRef, useState} from "react";
import {Trash} from "lucide-react";
import config from "../../../providers/apiConfig.js";
import UserEdit from "./UserEdit.jsx";

const Fieldset = ({legend, children}) => (
    <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
        <legend className="fieldset-legend">{legend}</legend>
        {children}
    </fieldset>
);

const Field = ({text, isEditing, field, onChange, onSave, onCancel, onEdit}) => (
    <div>
        <label className="label w-1/3">{text}</label>
        <div className="flex items-center">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        className="input flex-1"
                        value={field}
                        onChange={onChange}
                    />
                    <button className="btn btn-primary ml-2" onClick={onSave}>
                        Enregistrer
                    </button>
                    <button className="btn btn-secondary ml-2" onClick={onCancel}>
                        Annuler
                    </button>
                </>
            ) : (
                <>
                    <input type="text" className="input flex-1" value={field} disabled/>
                    <button className="btn btn-secondary ml-2" onClick={onEdit}>
                        Modifier
                    </button>
                </>
            )}
        </div>
    </div>
);

const UserForm = () => {
    const client = JSON.parse(localStorage.getItem("client"));
    const [isEditing, setIsEditing] = useState([]);
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
    const editModalRef = useRef(null);

    const handleUpdate = async (params) => {
        try {
            const headers = config.getHeaders()
            const response = await fetch(`${config.apiBaseUrl}/client/update`, {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(params),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("client", JSON.stringify(data.client));
                alert("Utilisateur mis à jour avec succès !");
                setIsEditing([]);
            } else {
                const error = await response.json();
                alert(`Erreur : ${error.error}`);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            alert("Une erreur est survenue.");
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/client/delete`, {
                method: "DELETE",
                headers: config.getHeaders(),
            });

            if (response.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("client");
                alert("Compte supprimé avec succès !");
            } else {
                const error = await response.json();
                alert(`Erreur : ${error.error}`);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du compte :", error);
            alert("Une erreur est survenue.");
        }
    };

    return (
        <div className={"flex flex-col items-center justify-center w-full p-6 bg-base-200"}>
            <Fieldset legend="Identifiants">
                <Field
                    text="Mon adresse email"
                    isEditing={isEditing.email}
                    field={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    onSave={() => handleUpdate({email: formData.email})}
                    onCancel={() => {
                        setFormData({...formData, email: client.email});
                        setIsEditing({...isEditing, email: false});
                    }}
                    onEdit={() => setIsEditing({...isEditing, email: true})}
                />

            </Fieldset>

            <Fieldset legend="Informations de facturation">
                <p>{client.lastname} {client.firstname}</p>
                <p>{client.zipcode}, {client.city}</p>
                <p>{client.phone}</p>
                <button
                    className="btn btn-secondary mt-4"
                    onClick={() => editModalRef.current.showModal()}
                >
                    Modifier
                </button>
            </Fieldset>

            <Fieldset legend="Supprimer mon compte">
                <p>Voulez-vous définitivement supprimer votre compte ?</p>
                <div className="flex items-center justify-center">
                    <button className="btn btn-error mt-4" onClick={handleDelete}>
                        <Trash className="mr-2"/>
                        <p>Supprimer mon compte</p>
                    </button>
                </div>
            </Fieldset>

            <UserEdit
                ref={editModalRef}
                user={formData}
                setUser={setFormData}
                onSave={handleUpdate}
            />
        </div>
    );
};

export default UserForm;