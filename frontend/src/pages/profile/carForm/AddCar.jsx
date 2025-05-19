import {forwardRef} from "react";
import {useState} from "react";
import carList from "../../../assets/car-list.json";


const AddCar = forwardRef((props, ref) => {
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [licensePlate, setLicensePlate] = useState("");
    const [mileage, setMileage] = useState("");

    const handleBrandChange = (e) => {
        setSelectedBrand(e.target.value);
        setSelectedModel("");
        setLicensePlate("");
        setMileage("");
    };

    const handleModelChange = (e) => {
        setSelectedModel(e.target.value);
    };

    return (
        <dialog ref={ref} id="add_car_modal" className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">Ajouter un véhicule</h3>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <label className="label w-1/3">Marque</label>
                    <select
                        className="select select-bordered w-full"
                        value={selectedBrand}
                        onChange={handleBrandChange}
                    >
                        <option value="">Sélectionnez une marque</option>
                        {carList.map((car, index) => (
                            <option key={index} value={car.brand}>
                                {car.brand}
                            </option>
                        ))}
                    </select>
                </fieldset>

                {selectedBrand && (
                    <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                        <label className="label w-1/3">Modèle</label>
                        <select
                            className="select select-bordered w-full"
                            value={selectedModel}
                            onChange={handleModelChange}
                        >
                            <option value="">Sélectionnez un modèle</option>
                            {carList
                                .find((car) => car.brand === selectedBrand)
                                ?.models.map((model, index) => (
                                    <option key={index} value={model}>
                                        {model}
                                    </option>
                                ))}
                        </select>
                    </fieldset>
                )}

                {selectedModel && (
                    <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                        <label className="label w-1/3">Plaque d'immatriculation</label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Ex: ABC123"
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value)}
                        />

                        <label className="label w-1/3 mt-4">Kilométrage</label>
                        <input
                            type="number"
                            className="input input-bordered w-full"
                            placeholder="Ex: 12000"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                        />
                    </fieldset>
                )}

                {selectedModel && licensePlate && mileage && (
                    <button className="btn btn-primary w-full mt-4">Ajouter</button>
                )}

            </div>
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
    );
});

export default AddCar;