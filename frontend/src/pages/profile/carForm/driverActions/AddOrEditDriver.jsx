import {forwardRef, useState, useEffect} from "react";

const AddOrEditDriver = forwardRef(({car, driver, onSave}, ref) => {
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    console.log(car)
    const [formData, setFormData] = useState({
        driver: true,
        driverPhone: "",
        driverFirstname: "",
        driverLastname: "",
        clientId: "",
        vehicleId: car?.id
    });

    useEffect(() => {
        if (driver) {
            setFormData({
                driver: driver.driver,
                driverPhone: driver.driverPhone,
                driverFirstname: driver.driverFirstname,
                driverLastname: driver.driverLastname,
                clientId: driver.clientId,
            });
        }
    }, [driver]);

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
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});

        const error = validateField(name, value);
        setErrors({...errors, [name]: error});

        const hasErrors = Object.values({...errors, [name]: error}).some((err) => err);
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
                <h3 className="text-lg font-bold">Ajouter ou Modifier un Conducteur</h3>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <label className="label w-1/3">Nom</label>
                    <input
                        type="text"
                        name="driverFirstname"
                        className={`input input-bordered w-full ${errors.driverFirstname ? "input-error" : ""}`}
                        placeholder="Ex: Dupont"
                        value={formData.driverFirstname}
                        onChange={handleChange}
                    />
                    {errors.driverFirstname && <span className="text-red-500">{errors.driverFirstname}</span>}
                </fieldset>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <label className="label w-1/3">Prénom</label>
                    <input
                        type="text"
                        name="driverLastname"
                        className={`input input-bordered w-full ${errors.driverLastname ? "input-error" : ""}`}
                        placeholder="Ex: Jean"
                        value={formData.driverLastname}
                        onChange={handleChange}
                    />
                    {errors.driverLastname && <span className="text-red-500">{errors.driverLastname}</span>}
                </fieldset>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <label className="label w-1/3">Numéro de Téléphone</label>
                    <input
                        type="tel"
                        name="driverPhone"
                        className={`input input-bordered w-full ${errors.driverPhone ? "input-error" : ""}`}
                        placeholder="Ex: 0123456789"
                        value={formData.driverPhone}
                        onChange={handleChange}
                    />
                    {errors.driverPhone && <span className="text-red-500">{errors.driverPhone}</span>}
                </fieldset>

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