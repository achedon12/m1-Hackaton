import {useState, useEffect} from "react";
import Loader from "../../components/Loader.jsx";
import config from "../../providers/apiConfig.js";
import {PageHeader} from "../../components";

const MeetingGrid = () => {
    const [meetingData, setMeetingData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMeetingData = async () => {
            try {
                const clientId = JSON.parse(localStorage.getItem('client')).id;
                const response = await fetch(
                    `${config.apiBaseUrl}/meeting/client/${clientId}`,
                    { headers: config.headers }
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const meetings = await response.json();

                const enrichedMeetings = await Promise.all(
                    meetings.map(async (meeting) => {
                        try {
                            const quotationRes = await fetch(
                                `${config.apiBaseUrl}/quotation/${meeting.quotation.id}`,
                                { headers: config.headers }
                            );

                            if (!quotationRes.ok) {
                                throw new Error('Erreur lors de la récupération du devis');
                            }
                            const quotation = await quotationRes.json();
                            console.log(quotation)
                            return {
                                ...meeting,
                                quotation,
                            };
                        } catch (quotationError) {
                            console.error(`Erreur pour le devis du meeting ${meeting.id}:`, quotationError);
                            return {
                                ...meeting,
                                quotation: null,
                            };
                        }
                    })
                );

                setMeetingData(enrichedMeetings);

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
            <PageHeader
                title={"Mes opérations effectuées"}
                description={"Consultez l'historique de vos opérations"}
                backgroundImage={"/garage1.jpg"}
            />
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
                                            {meeting.vehicle.brand.name}
                                        </p>
                                        <p className={"text-sm"}>
                                            {meeting.vehicle.model.name}
                                        </p>
                                        <p className={"text-sm"}>
                                            ({meeting.vehicle.registrationNumber})
                                        </p>
                                    </td>
                                    <td>{meeting.meetingState.name}</td>
                                    <td>{meeting.garage.name}</td>
                                    <td>
                                        {meeting.quotation &&
                                        Array.isArray(meeting.quotation.quotationOperations) &&
                                        meeting.quotation.quotationOperations.length > 0 ? (
                                            meeting.quotation.quotationOperations.map((qo) => (
                                                <div key={qo.id}>
                                                    {qo.operation?.libelle || (
                                                        <span className="text-gray-400 italic">Libellé manquant</span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">Aucune opération</span>
                                        )}
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

export default MeetingGrid;