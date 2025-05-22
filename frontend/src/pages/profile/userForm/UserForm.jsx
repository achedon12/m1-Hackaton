import { useRef, useState } from "react";
import { Trash } from "lucide-react";
import config from "../../../providers/apiConfig.js";
import UserEdit from "./UserEdit.jsx";

const Fieldset = ({ legend, children }) => (
    <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
        <legend className="fieldset-legend">{legend}</legend>
        {children}
    </fieldset>
);

const EditableField = ({ label, value, isEditing, onChange, onSave, onCancel, onEdit }) => (
    <div>
        <label className="label w-1/3">{label}</label>
        <div className="flex items-center">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        className="input flex-1"
                        value={value}
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
                    <input type="text" className="input flex-1" value={value} disabled />
                    <button className="btn btn-secondary ml-2" onClick={onEdit}>
                        Modifier
                    </button>
                </>
            )}
        </div>
    </div>
);

const AvatarUploader = ({ avatarUrl, onUpload }) => (
    <div className="flex items-center w-60 justify-between bg-base-100 border-base-200 border-2 p-4 rounded-xl">
        <img
            src={avatarUrl}
            alt="Photo de profil"
            className="w-24 h-24 rounded-full"
        />
        <button
            className="btn btn-secondary"
            onClick={() => document.getElementById("avatarInput").click()}
        >
            Modifier
        </button>
        <input
            type="file"
            id="avatarInput"
            className="hidden"
            accept="image/*"
            onChange={onUpload}
        />
    </div>
);

const UserForm = () => {
    const client = JSON.parse(localStorage.getItem("client"));
    const [isEditing, setIsEditing] = useState({});
    const [formData, setFormData] = useState({ ...client });
    const editModalRef = useRef(null);

    const handleUpdate = async (params) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/client/update`, {
                method: "POST",
                headers: config.getHeaders(),
                body: JSON.stringify(params),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("client", JSON.stringify(data.client));
                alert("Utilisateur mis à jour avec succès !");
                setIsEditing({});
            } else {
                const error = await response.json();
                alert(`Erreur : ${error.error}`);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
            alert("Une erreur est survenue.");
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("avatar", file);
            try {
                const response = await fetch(`${config.apiBaseUrl}/client/update`, {
                    method: "POST",
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("client", JSON.stringify(data.client));
                    setFormData({ ...formData, avatar: data.client.avatar });
                    window.location.reload();
                } else {
                    const error = await response.json();
                    alert(`Erreur : ${error.error}`);
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'avatar :", error);
                alert("Une erreur est survenue.");
            }
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
        <div className="flex flex-col items-center justify-center w-full p-6 bg-base-200">
            <AvatarUploader
                avatarUrl={`${config.baseUrl}/uploads/avatars/${client.avatar}`}
                onUpload={handleAvatarUpload}
            />
            <Fieldset legend="Identifiants">
                <EditableField
                    label="Mon adresse email"
                    value={formData.email}
                    isEditing={isEditing.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onSave={() => handleUpdate({ email: formData.email })}
                    onCancel={() => {
                        setFormData({ ...formData, email: client.email });
                        setIsEditing({ ...isEditing, email: false });
                    }}
                    onEdit={() => setIsEditing({ ...isEditing, email: true })}
                />
            </Fieldset>

            <Fieldset legend="Informations de facturation">
                <div>
                    <p>{client.lastname} {client.firstname}</p>
                    <p>{client.zipcode}, {client.city}</p>
                    <p>{client.phone}</p>
                    <button
                        className="btn btn-secondary mt-4"
                        onClick={() => editModalRef.current.showModal()}
                    >
                        Modifier
                    </button>
                </div>
            </Fieldset>

            <Fieldset legend="Supprimer mon compte">
                <p>Voulez-vous définitivement supprimer votre compte ?</p>
                <div className="flex items-center justify-center">
                    <button className="btn btn-error mt-4" onClick={handleDelete}>
                        <Trash className="mr-2" />
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