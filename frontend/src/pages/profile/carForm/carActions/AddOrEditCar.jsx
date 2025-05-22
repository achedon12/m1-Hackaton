import {useState, forwardRef, useEffect} from "react";
import config from "../../../../providers/apiConfig.js";

const AddOrEditCar = forwardRef(({car, onSave}, ref) => {
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

        if (car) {
            setVehiculeForm({
                id: car.id,
                brand: car.brand.id,
                model: car.model.id,
                kms: car.kms,
                circulationDate: car.circulationDate,
                registrationNumber: car.registrationNumber,
            });
        }

        fetchBrandsAndModels();
    }, [car]);

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
        const {name, value} = e.target;
        setVehiculeForm({...vehiculeForm, [name]: value});

        const error = validateField(name, value);
        setErrors({...errors, [name]: error});

        const hasErrors = Object.values({...errors, [name]: error}).some((err) => err);
        setIsFormValid(!hasErrors);
    }

    const handleSave = async () => {
        if (onSave && isFormValid) {
            onSave(vehiculeForm);
        }
        if (ref.current) {
            ref.current.close();
        }
    }

    return (
        <dialog ref={ref} id="add_car_modal" className="modal">
            <div className="modal-box">
                {car ? (
                    <>
                        <h3 className="text-lg font-bold">Modifier le véhicule</h3>
                        <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                            <label className="label w-1/3">Kilométrage</label>
                            <input
                                type="number"
                                name="kms"
                                className="input input-bordered w-full"
                                placeholder="Ex: 12000"
                                value={vehiculeForm.kms}
                                onChange={handleChange}
                            />
                            {errors.kms && <p className="text-red-500">{errors.kms}</p>}
                        </fieldset>
                    </>
                ) : (
                    <>
                        <h3 className="text-lg font-bold">Ajouter un véhicule</h3>
                        <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                            <label className="label w-1/3">Marque</label>
                            {isCustomBrand ? (
                                <input
                                    type="text"
                                    name="brand"
                                    className="input input-bordered w-full"
                                    placeholder="Entrez une marque"
                                    value={vehiculeForm.brand}
                                    onChange={handleChange}
                                />
                            ) : (
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
                            )}
                            {!isCustomBrand ? (
                                <p className="link text-xs mt-2 cursor-pointer" onClick={() => setIsCustomBrand(true)}>
                                    Ma marque n'est pas dans la liste
                                </p>
                            ) : (
                                <p className="link text-xs mt-2 cursor-pointer" onClick={() => setIsCustomBrand(false)}>
                                    Sélectionner une marque
                                </p>
                            )}
                        </fieldset>
                    </>
                )}

                {(vehiculeForm.brand && !car) && (
                    <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                        <label className="label w-1/3">Modèle</label>
                        {isCustomModel ? (
                            <input
                                type="text"
                                name="model"
                                className="input input-bordered w-full"
                                placeholder="Entrez un modèle"
                                value={vehiculeForm.model}
                                onChange={handleChange}
                            />
                        ) : (
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
                    </fieldset>
                )}

                {(vehiculeForm.model && !car) && (
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

                <button className={`btn btn-primary w-full mt-4`} onClick={handleSave} disabled={!isFormValid}>
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