import {forwardRef, useState} from "react";
import config from "../../../providers/apiConfig.js";

const UserEdit = forwardRef((props, ref) => {
    const {user, setUser} = props;
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [formData, setFormData] = useState({
        lastname: user.lastname,
        firstname: user.firstname,
        phone: user.phone,
        zipcode: user.zipcode,
        city: user.city,
    });

    const validateField = (name, value) => {
        let error = "";
        switch (name) {
            case "lastname":
                if (!value) error = "Ce champ est requis.";
                break;
            case "firstname":
                if (!value) error = "Ce champ est requis.";
                break;
            case "phone":
                if (!value) error = "Ce champ est requis.";
                break;
            case "zipcode":
                if (!value) error = "Ce champ est requis.";
                break;
            case "city":
                if (!value) error = "Ce champ est requis.";
                break;
            default:
                break;
        }
        return error;
    }

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
            const response = await fetch(`${config.apiBaseUrl}/client/update`, {
                method: 'PUT',
                headers: config.headers,
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                const error = await response.json();
                alert(`Erreur : ${error.message}`);
                return;
            }
            const data = await response.json();
            setUser(data);
            localStorage.setItem('client', JSON.stringify(data.client));
            ref.current.close();
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }

    return (
        <dialog ref={ref} id="edit_user_modal" className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">Modifier mes informations</h3>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <label className="label w-1/3">Nom</label>
                    <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                    />

                    <label className="label w-1/3">Prénom</label>
                    <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                    />

                    <label className="label w-1/3">Code Postal</label>
                    <input
                        type="text"
                        name="zipcode"
                        value={formData.zipcode}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                    />

                    <label className="label w-1/3">Ville</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                    />

                    <label className="label w-1/3">Téléphone</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                    />
                </fieldset>

                <div className="modal-action">
                    <button type="button" className="btn btn-primary" onClick={(e) => handleSubmit(e)} disabled={!isFormValid}>
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