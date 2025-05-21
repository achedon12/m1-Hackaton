import {useEffect, useState} from "react";
import Loader from "../../components/Loader.jsx";
import config from "../../providers/apiConfig.js";

const meetingGrid = () => {
    const [meetingData, setMeetingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetingData = async () => {
            try {
                const clientId = JSON.parse(localStorage.getItem('client')).id;
                const response = await fetch(`${config.apiBaseUrl}/meeting/${clientId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMeetingData(data);
            } catch (error) {
                console.error('Error fetching meeting data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetingData();
    }, []);

    return (
        <div className="w-full">
            <div className="relative w-full">
                <img src={"/garage1.jpg"} alt="Background" className="w-full h-50 object-cover opacity-75" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={"bg-white px-20 py-4 rounded-lg shadow-md text-center"}>
                        <h1 className="text-3xl font-bold">Mes opérations effectuées</h1>
                    </div>
                </div>
            </div>
            {loading ? (
                <Loader/>
            ) : (
                <div className="overflow-x-auto rounded-box border border-base-content/5 p-4">
                    <table className={"table bg-white mt-6"}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Véhicule</th>
                            <th>État</th>
                            <th>Garage</th>
                            <th>Opérations</th>
                        </tr>
                        </thead>
                        <tbody>
                        {meetingData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">Aucune opération effectuée</td>
                            </tr>
                        ) : (
                            meetingData.map(meeting => (
                                <tr key={meeting.id}>
                                    <td>{meeting.id}</td>
                                    <td>{new Date(meeting.meetingDate).toLocaleDateString()}</td>
                                    <td>
                                        <p className={"font-bold"}>
                                            {meeting.vehicule.brand.name}
                                        </p>
                                        <p className={"text-sm"}>
                                            {meeting.vehicule.model.name}
                                        </p>
                                        <p className={"text-sm"}>
                                            ({meeting.vehicule.registrationNumber})
                                        </p>
                                    </td>
                                    <td>{meeting.meetingState.name}</td>
                                    <td>{meeting.garage.name}</td>
                                    <td>
                                        {meeting.operations.map(operation => (
                                            <div key={operation.id}>{operation.libelle}</div>
                                        ))}
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default meetingGrid;