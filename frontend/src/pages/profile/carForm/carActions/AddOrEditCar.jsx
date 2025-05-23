import { useState, forwardRef, useEffect } from "react";
import config from "../../../../providers/apiConfig.js";
import {FormField} from "../../../../components";

const validateField = (name, value) => {
    let error = "";

    switch (name) {
        case "registrationNumber":
            const registrationNumberRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
            if (!registrationNumberRegex.test(value)) error = "La plaque d'immatriculation est invalide.";
            break;
        case "kms":
            if (value < 0) error = "Le kilométrage ne peut pas être négatif.";
            break;
        case "circulationDate":
            const currentYear = new Date().getFullYear();
            if (value < 1886 || value > currentYear) error = "L'année de circulation est invalide.";
            break;
        default:
            break;
    }

    return error;
};

const AddOrEditCar = forwardRef(({ car, onSave }, ref) => {
    const [brandsAndModelsList, setBrandsAndModelsList] = useState([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [isCustomBrand, setIsCustomBrand] = useState(false);
    const [isCustomModel, setIsCustomModel] = useState(false);
    const [vehiculeForm, setVehiculeForm] = useState({
        id: "",
        brand: "",
        model: "",
        kms: "",
        circulationDate: "",
        registrationNumber: "",
    });

    useEffect(() => {
        const fetchBrandsAndModels = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/model/list`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await response.json();
                setBrandsAndModelsList(data);
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };

        if (car) {
            setVehiculeForm({
                id: car.id,
                brand: car.brand.id,
                model: car.model.id,
                kms: car.kms,
                circulationDate: car.circulationDate,
                registrationNumber: car.registrationNumber,
            });
        } else {
            setVehiculeForm({
                id: "",
                brand: "",
                model: "",
                kms: "",
                circulationDate: "",
                registrationNumber: "",
            });
        }

        fetchBrandsAndModels();
    }, [car]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        setVehiculeForm({ ...vehiculeForm, [name]: value });
        setErrors({ ...errors, [name]: error });

        const hasErrors = Object.values({ ...errors, [name]: error }).some((err) => err);
        setIsFormValid(!hasErrors);
    };

    const handleSave = () => {
        if (onSave && isFormValid) {
            onSave(vehiculeForm);
        }
        if (ref.current) {
            ref.current.close();
        }
    };

    return (
        <dialog ref={ref} id="add_car_modal" className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">{car ? "Modifier le véhicule" : "Ajouter un véhicule"}</h3>

                <FormField
                    label="Marque"
                    name="brand"
                    type={isCustomBrand ? "text" : "select"}
                    value={vehiculeForm.brand}
                    onChange={handleChange}
                    error={errors.brand}
                    placeholder="Sélectionnez ou entrez une marque"
                />
                {!isCustomBrand ? (
                    <p className="link text-xs mt-2 cursor-pointer" onClick={() => setIsCustomBrand(true)}>
                        Ma marque n'est pas dans la liste
                    </p>
                ) : (
                    <p className="link text-xs mt-2 cursor-pointer" onClick={() => setIsCustomBrand(false)}>
                        Sélectionner une marque
                    </p>
                )}

                {vehiculeForm.brand && (
                    <FormField
                        label="Modèle"
                        name="model"
                        type={isCustomModel ? "text" : "select"}
                        value={vehiculeForm.model}
                        onChange={handleChange}
                        error={errors.model}
                        placeholder="Sélectionnez ou entrez un modèle"
                    />
                )}
                {!isCustomModel ? (
                    <p className="link text-xs mt-2 cursor-pointer" onClick={() => setIsCustomModel(true)}>
                        Mon modèle n'est pas dans la liste
                    </p>
                ) : (
                    <p className="link text-xs mt-2 cursor-pointer" onClick={() => setIsCustomModel(false)}>
                        Sélectionner un modèle
                    </p>
                )}

                <FormField
                    label="Kilométrage"
                    name="kms"
                    type="number"
                    value={vehiculeForm.kms}
                    onChange={handleChange}
                    error={errors.kms}
                    placeholder="Ex: 12000"
                />
                <FormField
                    label="Année"
                    name="circulationDate"
                    type="number"
                    value={vehiculeForm.circulationDate}
                    onChange={handleChange}
                    error={errors.circulationDate}
                    placeholder="Ex: 2023"
                />
                <FormField
                    label="Plaque d'immatriculation"
                    name="registrationNumber"
                    value={vehiculeForm.registrationNumber}
                    onChange={handleChange}
                    error={errors.registrationNumber}
                    placeholder="Ex: AB-123-CD"
                />

                <button className="btn btn-primary w-full mt-4" onClick={handleSave} disabled={!isFormValid}>
                    {car ? "Modifier le véhicule" : "Ajouter le véhicule"}
                </button>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
    );
});

export default AddOrEditCar;