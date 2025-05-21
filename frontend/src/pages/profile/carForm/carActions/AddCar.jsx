import {useState, forwardRef, useEffect} from "react";
import config from "../../../../providers/apiConfig.js";

const AddCar = forwardRef((props, ref) => {
    const [brandsAndModelsList, setBrandsAndModelsList] = useState([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [vehiculeForm, setVehiculeForm] = useState({
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
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                setBrandsAndModelsList(data);
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        }

        fetchBrandsAndModels();
    }, []);

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "registrationNumber":
                const registrationNumberRegex = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
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
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setVehiculeForm({ ...vehiculeForm, [name]: value });

        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });

        const hasErrors = Object.values({ ...errors, [name]: error }).some((err) => err);
        setIsFormValid(!hasErrors);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${config.apiBaseUrl}/vehicle/create`, {
                method: 'POST',
                headers: config.headers,
                body: JSON.stringify({
                    brand: vehiculeForm.brand,
                    model: vehiculeForm.model,
                    kms: vehiculeForm.kms,
                    circulationDate: vehiculeForm.circulationDate,
                    registrationNumber: vehiculeForm.registrationNumber,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Erreur: ${errorData.message}`);
            }

            const data = await response.json();
            console.log('Vehicle added successfully:', data);
            ref.current.close();
        } catch (error) {
            console.error('Error adding vehicle:', error);
        }
    }

    return (
        <dialog ref={ref} id="add_car_modal" className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">Ajouter un véhicule</h3>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <label className="label w-1/3">Marque</label>
                    <select
                        className="select select-bordered w-full"
                        name="brand"
                        value={vehiculeForm.brand}
                        onChange={handleChange}
                    >
                        <option value="">Sélectionnez une marque</option>
                        {[...new Map(brandsAndModelsList.map((car) => [car.brand.id, car.brand])).values()]
                            .map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                    </select>
                </fieldset>

                {vehiculeForm.brand && (
                    <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                        <label className="label w-1/3">Modèle</label>
                        <select
                            className="select select-bordered w-full"
                            name="model"
                            value={vehiculeForm.model}
                            onChange={handleChange}
                        >
                            <option value="">Sélectionnez un modèle</option>
                            {brandsAndModelsList
                                .filter((model) => model.brand.id === parseInt(vehiculeForm.brand))
                                .map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                        </select>
                    </fieldset>
                )}

                {vehiculeForm.model && (
                    <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                        <label className="label w-1/3 mt-4">Kilométrage</label>
                        <input
                            type="number"
                            name="kms"
                            className="input input-bordered w-full"
                            placeholder="Ex: 12000"
                            value={vehiculeForm.kms}
                            onChange={handleChange}
                        />
                        {errors.kms && <p className="text-red-500">{errors.kms}</p>}

                        <label className="label w-1/3 mt-4">Année</label>
                        <input
                            type="number"
                            name="circulationDate"
                            className="input input-bordered w-full"
                            placeholder="Ex: 2023"
                            value={vehiculeForm.circulationDate}
                            onChange={handleChange}
                        />
                        {errors.circulationDate && <p className="text-red-500">{errors.circulationDate}</p>}

                        <label className="label w-1/3">Plaque d'immatriculation</label>
                        <input
                            type="text"
                            name="registrationNumber"
                            className="input input-bordered w-full"
                            placeholder="Ex: ABC123"
                            value={vehiculeForm.registrationNumber}
                            onChange={handleChange}
                        />
                        {errors.registrationNumber && <p className="text-red-500">{errors.registrationNumber}</p>}
                    </fieldset>
                )}

                <button className={`btn btn-primary w-full mt-4`} onClick={handleSubmit} disabled={!isFormValid}>
                    Ajouter
                </button>

            </div>
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
    );
});

export default AddCar;