import { forwardRef, useState } from "react";
import config from "../../../providers/apiConfig.js";
import {FormField} from "../../../components";

const validateField = (name, value) => {
    if (!value) return "Ce champ est requis.";
    return "";
};

const UserEdit = forwardRef((props, ref) => {
    const { user, setUser } = props;
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [formData, setFormData] = useState({
        lastname: user.lastname,
        firstname: user.firstname,
        phone: user.phone,
        zipcode: user.zipcode,
        city: user.city,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: error });

        const hasErrors = Object.values({ ...errors, [name]: error }).some((err) => err);
        setIsFormValid(!hasErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${config.apiBaseUrl}/client/update`, {
                method: "PUT",
                headers: config.getHeaders(),
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const error = await response.json();
                alert(`Erreur : ${error.message}`);
                return;
            }
            const data = await response.json();
            setUser(data);
            localStorage.setItem("client", JSON.stringify(data.client));
            ref.current.close();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <dialog ref={ref} id="edit_user_modal" className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">Modifier mes informations</h3>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <FormField
                        label="Nom"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        error={errors.lastname}
                        placeholder="Nom"
                    />
                    <FormField
                        label="Prénom"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        error={errors.firstname}
                        placeholder="Prénom"
                    />
                    <FormField
                        label="Code Postal"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleChange}
                        error={errors.zipcode}
                        placeholder="Code Postal"
                    />
                    <FormField
                        label="Ville"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        error={errors.city}
                        placeholder="Ville"
                    />
                    <FormField
                        label="Téléphone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="Téléphone"
                    />
                </fieldset>

                <div className="modal-action">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                    >
                        Enregistrer
                    </button>
                    <button type="button" className="btn" onClick={() => ref.current.close()}>
                        Fermer
                    </button>
                </div>
            </div>
        </dialog>
    );
});

export default UserEdit;