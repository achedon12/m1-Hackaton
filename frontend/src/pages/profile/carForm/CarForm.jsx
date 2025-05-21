import {useEffect, useState, useRef} from "react";
import {Trash} from "lucide-react";
import AddCar from "./carActions/AddCar.jsx";
import EditCar from "./carActions/EditCar.jsx";
import AddOrEditDriver from "./driverActions/AddOrEditDriver.jsx";
import config from "../../../providers/apiConfig.js";
import {Loader} from "../../../components/index.js";

const CarForm = () => {
    const client = JSON.parse(localStorage.getItem('client'));
    const [activeCar, setActiveCar] = useState(null);
    const [addCarModal, setAddCarModal] = useState(false);
    const modalRef = useRef(null);
    const editModalRef = useRef(null);
    const [carToEdit, setCarToEdit] = useState(null);
    const [driverToEdit, setDriverToEdit] = useState(null);
    const [isEditDriver, setIsEditDriver] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${config.apiBaseUrl}/vehicle/client/${client.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setVehicles(data);
                if (data.length > 0) {
                    setActiveCar(data[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            }
        };

        fetchVehicles();
    }, []);


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

    const handleCarDelete = async (carId) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/vehicle/delete/${carId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setVehicles(vehicles.filter(car => car.id !== carId));
        } catch (error) {
            console.error('Error deleting vehicle:', error);
        }
    }

    const handleSaveCar = async (updatedCar) => {
        setVehicles(vehicles.map(car => (car.id === updatedCar.id ? updatedCar : car)));
        setCarToEdit(null);
        if (editModalRef.current) {
            editModalRef.current.close();
        }
        try {
            const response = await fetch(`${config.apiBaseUrl}/vehicle/update/${updatedCar.id}`, {
                method: 'PUT',
                headers: config.headers,
                body: JSON.stringify({
                    brand: updatedCar.brand.id,
                    model: updatedCar.model.id,
                    kms: updatedCar.kms,
                    circulationDate: updatedCar.circulationDate,
                    registrationNumber: updatedCar.registrationNumber,
                    vin: updatedCar.vin,
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error updating vehicle:', error);
        }
    };

    const handleDriverAddOrEditClick = (isEdit, driver) => {
        setDriverToEdit(driver);
        setIsEditDriver(isEdit);
        if (editModalRef.current) {
            editModalRef.current.showModal();
        }
    }

    const handleDriverSave = async (driver) => {
        setActiveCar({
            ...activeCar,
            drivers: [...activeCar.drivers, driver]
        });
        if (editModalRef.current) {
            editModalRef.current.close();
        }
        if (isEditDriver) {
            try {
                const response = await fetch(`${config.apiBaseUrl}/driver/update/${driver.id}`, {
                    method: 'PUT',
                    headers: config.headers,
                    body: JSON.stringify({
                        driverPhone: driver.driverPhone,
                        driverFirstname: driver.driverFirstname,
                        driverLastname: driver.driverLastname,
                    })
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error('Error updating driver:', error);
            }
        } else {
            try {
                const response = await fetch(`${config.apiBaseUrl}/driver/create`, {
                    method: 'POST',
                    headers: config.headers,
                    body: JSON.stringify({
                        driverPhone: driver.driverPhone,
                        driverFirstname: driver.driverFirstname,
                        driverLastname: driver.driverLastname,
                        vehicleId: activeCar.id,
                        clientId: client.id
                    })
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error('Error creating driver:', error);
            }
        }
    }

    return (
        <>
            <div className={"flex flex-col md:flex-row justify-between items-center w-full"}>
                {loading ? (
                        <Loader/>
                    ) :
                    <ul className={`list bg-base-100 rounded-box shadow-md ${vehicles.length > 0 ? "w-full md:w-4/5 block" : "hidden"}`}>
                        {vehicles.map((car, index) => (
                            <li key={index} onClick={() => setActiveCar(car)}
                                className="list-row flex justify-between items-center hover:bg-base-200 hover:cursor-pointer active:bg-base-200">
                                <div className="flex items-center">
                                    <img src={config.baseUrl + "/" + car.brand.logoUrl} alt="brand logo" className="h-10 rounded-lg mr-4"/>
                                    <div>
                                        <p className="font-bold">{car.brand.name} {car.model.name}</p>
                                        <p className="text-sm text-gray-500">{car.registrationNumber} - {car.kms} km</p>
                                    </div>
                                </div>
                                <div className={"w-1/3 md:w-1/6 flex justify-between items-center"}>
                                    <button className="btn btn-secondary" onClick={() => handleEditCarClick(car)}>
                                        Modifier
                                    </button>
                                    <button className="btn btn-error" onClick={() => handleCarDelete(car.id)}>
                                        <Trash className="w-4 h-4"/>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                }

                <div className={`flex justify-center items-center ${vehicles.length > 0 ? "md:w-1/5" : ""}`}>
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
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Mes conducteurs" />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className={"flex justify-between items-center mb-4"}>
                                    <h3 className="text-lg font-bold mb-4">Mes conducteurs pour {activeCar.brand.name} {activeCar.model.name}</h3>
                                    <div>
                                        {(client.societyName === null && activeCar.drivers.length === 0) && (
                                            <button className="btn btn-primary mr-2" onClick={() => handleDriverSave({
                                                driverFirstname: client.firstname,
                                                driverLastname: client.lastname,
                                                driverPhone: client.phone,
                                            })}>
                                                M'ajouter en tant que conducteur
                                            </button>
                                        )}
                                        <button className="btn btn-secondary" onClick={() => handleDriverAddOrEditClick(false, null)}>
                                            Ajouter un conducteur
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                                    <table className="table w-full">
                                        <thead className={"bg-base-200"}>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Prénom</th>
                                            <th>Téléphone</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {activeCar.drivers?.map((driver, index) => (
                                            <tr key={index}>
                                                <td>{driver.driverLastname}</td>
                                                <td>{driver.driverFirstname}</td>
                                                <td>{driver.driverPhone}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Mes prestations" defaultChecked />
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <h3 className="text-lg font-bold mb-4">Mes prestations
                                    pour {activeCar.brand.name} {activeCar.model.name}</h3>
                                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                                    <table className="table w-full">
                                        <thead className={"bg-base-200"}>
                                        <tr>
                                            <th>Date</th>
                                            <th>Libellé</th>
                                            <th>Coût (€)</th>
                                        </tr>
                                        </thead>
                                        {
                                            activeCar.operations?.map((service, index) => (
                                                <tr key={index}>
                                                    <td>{new Date(service.date).toLocaleDateString()}</td>
                                                    <td>{service.libelle}</td>
                                                    <td>{service.price}</td>
                                                </tr>
                                            ))
                                        }
                                        <tbody>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <AddCar ref={modalRef}/>
            <EditCar ref={editModalRef} car={carToEdit} onSave={handleSaveCar}/>
            <AddOrEditDriver ref={editModalRef} car={activeCar} onSave={handleDriverSave} driver={driverToEdit}/>
        </>
    );
};

export default CarForm;