import {forwardRef, useState, useEffect} from "react";

const EditCar = forwardRef(({car, onSave}, ref) => {
    const [mileage, setMileage] = useState("");

    useEffect(() => {
        if (car) {
            setMileage(car.mileage);
        }
    }, [car]);

    const handleSave = () => {
        if (onSave && car) {
            onSave({...car, mileage});
        }
        if (ref.current) {
            ref.current.close();
        }
    };

    return (
        <dialog ref={ref} id="edit_car_modal" className="modal">
            <div className="modal-box">
                <h3 className="text-lg font-bold">Modifier le kilométrage</h3>

                <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
                    <label className="label w-1/3">Kilométrage</label>
                    <input
                        type="number"
                        className="input input-bordered w-full"
                        placeholder="Ex: 12000"
                        value={mileage}
                        onChange={(e) => setMileage(e.target.value)}
                    />
                </fieldset>

                <div className="modal-action">
                    <button className="btn btn-primary" onClick={handleSave}>
                        Enregistrer
                    </button>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>Fermer</button>
                </form>
            </div>
        </dialog>
    );
});

export default EditCar;