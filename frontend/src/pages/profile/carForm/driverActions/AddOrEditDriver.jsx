import { forwardRef, useState, useEffect } from "react";
import {FormField} from "../../../../components";

const validateField = (name, value) => {
    let error = "";

    switch (name) {
        case "driverPhone":
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(value)) error = "Le numéro de téléphone est invalide.";
            break;
        case "driverFirstname":
        case "driverLastname":
            if (!value) error = "Ce champ est requis.";
            break;
        default:
            break;
    }

    return error;
};

const AddOrEditDriver = forwardRef(({ car, driver, onSave }, ref) => {
    const [errors, setErrors] = useState({});
    const client = JSON.parse(localStorage.getItem("client"));
    const [isFormValid, setIsFormValid] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        driver: true,
        driverPhone: "",
        driverFirstname: "",
        driverLastname: "",
        clientId: client.id,
        vehicleId: car?.id,
    });

    useEffect(() => {
        if (driver) {
            setFormData({
                id: driver.id,
                driver: driver.driver,
                driverPhone: driver.driverPhone,
                driverFirstname: driver.driverFirstname,
                driverLastname: driver.driverLastname,
                clientId: driver.clientId,
                vehicleId: car?.id,
            });
        }
    }, [driver, car]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: error });

        const hasErrors = Object.values({ ...errors, [name]: error }).some((err) => err);
        setIsFormValid(!hasErrors);
    };

    const handleSave = () => {
        if (onSave) {
            onSave(formData);
        }
        if (ref.current) {
            ref.current.close();
        }
    };

    return (
        <dialog ref={ref} id="add_or_edit_driver_modal" className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">{driver ? "Modifier le conducteur" : "Ajouter un conducteur"}</h3>

                <FormField
                    label="Nom"
                    name="driverFirstname"
                    value={formData.driverFirstname}
                    onChange={handleChange}
                    error={errors.driverFirstname}
                    placeholder="Ex: Dupont"
                />
                <FormField
                    label="Prénom"
                    name="driverLastname"
                    value={formData.driverLastname}
                    onChange={handleChange}
                    error={errors.driverLastname}
                    placeholder="Ex: Jean"
                />
                <FormField
                    label="Numéro de Téléphone"
                    name="driverPhone"
                    type="tel"
                    value={formData.driverPhone}
                    onChange={handleChange}
                    error={errors.driverPhone}
                    placeholder="Ex: 0123456789"
                />

                <div className="modal-action">
                    <button
                        className={`btn btn-primary ${!isFormValid ? "btn-disabled" : ""}`}
                        onClick={handleSave}
                    >
                        Enregistrer
                    </button>
                    <button className="btn" onClick={() => ref.current.close()}>
                        Annuler
                    </button>
                </div>
            </div>
        </dialog>
    );
});

export default AddOrEditDriver;