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
    const [activeCarDrivers, setActiveCarDrivers] = useState([]);
    const [activeCarMeeting, setActiveCarMeeting] = useState([]);
    const [activeDriver, setActiveDriver] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carInfosLoaded, setCarInfosLoaded] = useState(false);

    const addCarModalRef = useRef(null);
    const editCarModalRef = useRef(null);
    const addOrEditDriverModalRef = useRef(null);

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (activeCar) {
            fetchVehicleData(activeCar.id);
        }
    }, [activeCar]);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.apiBaseUrl}/vehicle/client/${client.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Erreur lors de la récupération des véhicules');
            const data = await response.json();
            setVehicles(data);
            if (data.length > 0) setActiveCar(data[0]);
        } catch (error) {
            console.error(error);
            setVehicles([]);
            setActiveCar(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleData = async (vehicleId) => {
        setCarInfosLoaded(false);
        try {
            const [drivers, meetings] = await Promise.all([
                fetchData(`${config.apiBaseUrl}/driver/vehicle/${vehicleId}`),
                fetchData(`${config.apiBaseUrl}/meeting/vehicle/${vehicleId}`)
            ]);
            setActiveCarDrivers(drivers);
            setActiveCarMeeting(meetings);
        } catch (error) {
            console.error(error);
        } finally {
            setCarInfosLoaded(true);
        }
    };

    const fetchData = async (url) => {
        const response = await fetch(url, {
            method: "GET",
            headers: config.headers
        });
        if (!response.ok) throw new Error('Erreur lors de la récupération des données');
        return response.json();
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
            if (!response.ok) throw new Error('Erreur lors de la suppression du véhicule');
            setVehicles(vehicles.filter(car => car.id !== carId));
        } catch (error) {
            console.error(error);
        }
    };

    const handleCarSave = async (car) => {
        try {
            const url = car.id
                ? `${config.apiBaseUrl}/vehicle/update/${car.id}`
                : `${config.apiBaseUrl}/vehicle/create`;
            const method = car.id ? 'PUT' : 'POST';
            const body = JSON.stringify({
                brand: car.brand.id,
                model: car.model.id,
                circulationDate: car.circulationDate,
                kms: car.kms,
                registrationNumber: car.registrationNumber,
            });
            const response = await fetch(url, {method, headers: config.headers, body});
            if (!response.ok) throw new Error('Erreur lors de la sauvegarde du véhicule');
            if (!car.id) setVehicles([...vehicles, car]);
        } catch (error) {
            console.error(error);
        }
    }

    const handleDriverSave = async (driver) => {
        try {
            const url = driver.id
                ? `${config.apiBaseUrl}/driver/${driver.id}`
                : `${config.apiBaseUrl}/driver`;
            const method = driver.id ? 'PUT' : 'POST';
            const body = JSON.stringify({
                driverPhone: driver.driverPhone,
                driverFirstname: driver.driverFirstname,
                driverLastname: driver.driverLastname,
                vehicleId: activeCar.id,
                clientId: client.id
            });
            const response = await fetch(url, {method, headers: config.headers, body});
            if (!response.ok) throw new Error('Erreur lors de la sauvegarde du conducteur');
            if (!driver.id) setActiveCarDrivers([...activeCarDrivers, driver]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row justify-between items-center w-full">
                {loading ? (
                    <Loader/>
                ) : (
                    <VehicleList
                        vehicles={vehicles}
                        onCarClick={setActiveCar}
                        onCarDelete={handleCarDelete}
                        onAddCarClick={() => addCarModalRef.current?.showModal()}
                        onEditCarClick={(car) => editCarModalRef.current?.showModal(car)}
                    />
                )}
            </div>

            <div className="w-full mt-6">
                {(!carInfosLoaded && activeCar) ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader/>
                    </div>
                ) : (
                    <CarDetails
                        activeCar={activeCar}
                        drivers={activeCarDrivers}
                        meetings={activeCarMeeting}
                        onDriverSave={handleDriverSave}
                        onEdit={(car) => addOrEditDriverModalRef.current?.showModal(car)}
                    />
                )}
            </div>

            <AddCar ref={addCarModalRef} onSave={handleCarSave}/>
            <EditCar ref={editCarModalRef} car={activeCar} onSave={handleCarSave}/>
            <AddOrEditDriver ref={addOrEditDriverModalRef} car={activeCar} driver={activeDriver} onSave={handleDriverSave}/>
        </>
    );
};

const VehicleList = ({vehicles, onCarClick, onCarDelete, onAddCarClick, onEditCarClick}) => (
    <ul className={`list bg-base-100 rounded-box shadow-md w-full`}>
        {vehicles.map((car, index) => (
            <li key={index} onClick={() => onCarClick(car)}
                className="list-row flex justify-between items-center hover:bg-base-200 hover:cursor-pointer active:bg-base-200">
                <div className="flex items-center">
                    <div className="w-12 h-12 flex justify-center items-center mr-4">
                        <img src={config.baseUrl + "/" + car.brand.logoUrl} alt="brand logo"/>
                    </div>
                    <div>
                        <p className="font-bold">{car.brand.name} {car.model.name}</p>
                        <p className="text-sm text-gray-500">{car.registrationNumber} - {car.kms} km</p>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <button className="btn btn-secondary" onClick={() => onEditCarClick(car)}>
                        Modifier
                    </button>
                    <button className="btn btn-error" onClick={() => onCarDelete(car.id)}>
                        <Trash className="w-4 h-4"/>
                    </button>
                </div>
            </li>
        ))}
        <button className="btn btn-tertiary w-full text-secondary mt-4" onClick={onAddCarClick}>
            Ajouter un véhicule
        </button>
    </ul>
);

const CarDetails = ({activeCar, drivers, meetings, onDriverSave, onEdit}) => (
    <div className="my-10">
        {activeCar && (
        <div className="tabs tabs-lift">
            <input type="radio" name="my_tabs_3" className="tab" aria-label="Mes conducteurs"/>
            <div className="tab-content bg-base-100 border-base-300 p-6">
                <div className={"flex justify-between items-center mb-4"}>
                    <h3 className="text-lg font-bold mb-4">Mes conducteurs pour {activeCar.brand.name} {activeCar.model.name}</h3>
                    <button className="btn btn-primary" onClick={() => onEdit(activeCar)}>
                        Ajouter un conducteur
                    </button>
                </div>
                <DriverTable drivers={drivers} onDriverSave={onDriverSave} onEdit={onEdit}/>
            </div>
            <input type="radio" name="my_tabs_3" className="tab" aria-label="Mes prestations" defaultChecked/>
            <div className="tab-content bg-base-100 border-base-300 p-6">
                <h3 className="text-lg font-bold mb-4">Mes prestations pour {activeCar.brand.name} {activeCar.model.name}</h3>
                <MeetingTable meetings={meetings}/>
            </div>
        </div>
        )}
    </div>
);

const DriverTable = ({drivers, onDriverSave, onEdit}) => (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table w-full">
            <thead className="bg-base-200">
            <tr>
                <th>Actions</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Téléphone</th>
            </tr>
            </thead>
            <tbody>
            {drivers.map((driver, index) => (
                <tr key={index}>
                    <td className="flex items-center">
                        <button className="btn btn-error" onClick={() => onDriverSave(driver)}>
                            <Trash className="w-4 h-4"/>
                        </button>
                        <button className="btn btn-secondary ml-2" onClick={() => onEdit(driver)}>
                            Modifier
                        </button>
                    </td>
                    <td>{driver.driverLastname}</td>
                    <td>{driver.driverFirstname}</td>
                    <td>{driver.driverPhone}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

const MeetingTable = ({meetings}) => (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table w-full">
            <thead className="bg-base-200">
            <tr>
                <th>Date</th>
                <th>Libellé</th>
                <th>Coût (€)</th>
            </tr>
            </thead>
            <tbody>
            {meetings.map((meeting, index) => (
                <tr key={index}>
                    <td>{new Date(meeting.meetingDate).toLocaleDateString()}</td>
                    <td>{meeting.libelle}</td>
                    <td>{meeting.price}</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export default CarForm;