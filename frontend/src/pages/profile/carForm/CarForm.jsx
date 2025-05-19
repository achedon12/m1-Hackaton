import {useState, useRef} from "react";
import {Trash} from "lucide-react";
import AddCar from "./AddCar.jsx";
import EditCar from "./EditCar.jsx";

const CarForm = () => {
    const [activeCar, setActiveCar] = useState(null);
    const [addCarModal, setAddCarModal] = useState(false);
    const modalRef = useRef(null);
    const editModalRef = useRef(null);
    const cars = [
        {
            brand: "Toyota",
            model: "Corolla",
            year: 2020,
            color: "Red",
            licensePlate: "ABC123",
            mileage: 12000,
            services: [
                {date: "2023-01-15", description: "Vidange", cost: 100},
                {date: "2023-03-10", description: "Changement de pneus", cost: 400},
            ],
        },
        {
            brand: "Honda",
            model: "Civic",
            year: 2019,
            color: "Blue",
            licensePlate: "XYZ456",
            mileage: 15000,
            services: [
                {date: "2023-02-20", description: "Révision générale", cost: 200},
            ],
        },
        {
            brand: "Ford",
            model: "Mustang",
            year: 2021,
            color: "Black",
            licensePlate: "LMN789",
            mileage: 8000,
            services: [
                {date: "2023-04-05", description: "Changement de freins", cost: 300},
            ],
        },
    ];

    const [carToEdit, setCarToEdit] = useState(null);

    const handleAddCarClick = () => {
        setAddCarModal(true);
        if (modalRef.current) {
            modalRef.current.showModal();
        }
    };


    const handleEditCarClick = (car) => {
        setCarToEdit(car);
        if (editModalRef.current) {
            editModalRef.current.showModal();
        }
    };

    const handleSaveCar = (updatedCar) => {
        // Logique pour sauvegarder les modifications
    };

    return (
        <>
            <div className={"flex flex-col md:flex-row justify-between items-center w-full"}>

                <ul className="list bg-base-100 rounded-box shadow-md w-full md:w-4/5 md:mr-6">
                    {cars.map((car, index) => (
                        <li key={index} onClick={() => setActiveCar(car)}
                            className="list-row flex justify-between items-center hover:bg-base-200 hover:cursor-pointer active:bg-base-200">
                            <div>
                                <p className="font-bold">{car.brand} {car.model}</p>
                                <p className="text-sm text-gray-500">Année : {car.year} | Plaque : {car.licensePlate}</p>
                            </div>
                            <div className={"w-1/3 md:w-1/6 flex justify-between items-center"}>
                                <button className="btn btn-secondary" onClick={() => handleEditCarClick(car)}>
                                    Modifier
                                </button>
                                <button className="btn btn-error" onClick={() => {
                                    // Logic to delete the car
                                }}>
                                    <Trash className="w-4 h-4"/>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="md:w-1/5 flex justify-center items-center">
                    <button
                        className="btn btn-tertiary w-full text-secondary mt-4 md:mt-0 md:h-12"
                        onClick={handleAddCarClick}
                    >
                        Ajouter un véhicule
                    </button>
                </div>
            </div>

            <div className="w-full mt-6 md:mt-0">
                {activeCar && (
                    <div className="my-10">
                        <h3 className="text-lg font-bold mb-4">Mes prestations
                            pour {activeCar.brand} {activeCar.model}</h3>
                        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                            <table className="table w-full">
                                <thead className={"bg-base-200"}>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Coût (€)</th>
                                </tr>
                                </thead>
                                <tbody>
                                {activeCar.services.map((service, index) => (
                                    <tr key={index}>
                                        <td>{service.date}</td>
                                        <td>{service.description}</td>
                                        <td>{service.cost}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <AddCar ref={modalRef}/>
            <EditCar ref={editModalRef} car={carToEdit} onSave={handleSaveCar} />
        </>
    );
};

export default CarForm;