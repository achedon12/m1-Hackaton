import React, { useState, useEffect } from "react";
import Loader from "../../components/Loader.jsx";
import config from "../../providers/apiConfig.js";
import { PageHeader } from "../../components";
import { Snackbar, Box } from "@mui/material";

const MeetingStatusConfig = {
    created: { label: "Créé", bgColor: "bg-blue-500" },
    confirmed: { label: "Confirmé", bgColor: "bg-green-600" },
    cancelled: { label: "Annulé", bgColor: "bg-red-500" },
    completed: { label: "Terminé", bgColor: "bg-gray-700" },
};

const MeetingRow = ({ meeting, idx, meetingStates, handleStatusChange }) => {
    const status = MeetingStatusConfig[meeting.meetingState.name];

    return (
        <tr key={meeting.id}>
            <td>{meeting.id}</td>
            <td>{new Date(meeting.meetingDate).toLocaleDateString()}</td>
            <td>
                <p className="font-bold">{meeting.vehicle.brand.name}</p>
                <p className="text-sm">{meeting.vehicle.model.name}</p>
                <p className="text-sm">({meeting.vehicle.registrationNumber})</p>
            </td>
            <td>
                {status ? (
                    <span className={`${status.bgColor} text-white rounded px-3 py-1 inline-block`}>
                        {status.label}
                    </span>
                ) : (
                    meeting.meetingState.name
                )}
            </td>
            <td>{meeting.garage.name}</td>
            <td>
                {meeting.quotation?.quotationOperations?.length > 0 ? (
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
            <td>
                {meeting.quotation?.hash ? (
                    <a
                        href={`${config.baseUrl}/uploads/quotations/${meeting.quotation.hash}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Télécharger
                    </a>
                ) : (
                    <span className="text-sm text-gray-400 italic">Non disponible</span>
                )}
            </td>
            <td>
                <select
                    value={meeting.meetingState.name}
                    onChange={(e) => handleStatusChange(e, meeting.id, idx)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                    {meetingStates.map((state) => (
                        <option key={state.id} value={state.name}>
                            {MeetingStatusConfig[state.name]?.label || state.name}
                        </option>
                    ))}
                </select>
            </td>
            <td>
                {meeting.meetingState.name === "completed" && meeting.invoice?.hash ? (
                    <a
                        href={`${config.baseUrl}/uploads/bills/${meeting.invoice.hash}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                    >
                        Télécharger
                    </a>
                ) : meeting.meetingState.name === "completed" ? (
                    <span className="text-sm text-gray-400 italic">Facture non disponible</span>
                ) : (
                    <span className="text-sm text-gray-400 italic">Non disponible</span>
                )}
            </td>
        </tr>
    );
};

const MeetingGrid = () => {
    const [meetingData, setMeetingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meetingStates, setMeetingStates] = useState([]);
    const [snackbar, setSnackbar] = useState("");

    useEffect(() => {
        const fetchMeetingStates = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/meetingstate/list`, {
                    headers: config.getHeaders(),
                });
                if (!response.ok) throw new Error("Erreur lors du chargement des statuts");
                const data = await response.json();
                setMeetingStates(data);
            } catch (error) {
                console.error("Erreur récupération des statuts :", error);
            }
        };

        const fetchMeetingData = async () => {
            try {
                const clientId = JSON.parse(localStorage.getItem("client")).id;
                const response = await fetch(
                    `${config.apiBaseUrl}/meeting/client/${clientId}`,
                    { headers: config.getHeaders() }
                );
                if (!response.ok) throw new Error("Network response was not ok");

                const meetings = await response.json();

                const enrichedMeetings = await Promise.all(
                    meetings.map(async (meeting) => {
                        try {
                            const quotationRes = await fetch(
                                `${config.apiBaseUrl}/quotation/${meeting.quotation.id}`,
                                { headers: config.getHeaders() }
                            );
                            if (!quotationRes.ok) throw new Error("Erreur lors de la récupération du devis");
                            const quotation = await quotationRes.json();

                            let invoice = null;

                            if (meeting.meetingState.name === "completed") {
                                const billRes = await fetch(`${config.apiBaseUrl}/bill/meeting/${meeting.id}`, {
                                    headers: config.getHeaders(),
                                });
                                if (billRes.ok) {
                                    const billJson = await billRes.json();
                                    invoice = Array.isArray(billJson) && billJson.length > 0 ? billJson[0] : null;
                                }
                            }

                            return {
                                ...meeting,
                                quotation,
                                invoice,
                            };
                        } catch (error) {
                            console.error(`Erreur pour le meeting ${meeting.id}:`, error);
                            return {
                                ...meeting,
                                quotation: null,
                                invoice: null,
                            };
                        }
                    })
                );

                setMeetingData(enrichedMeetings);
            } catch (error) {
                console.error("Error fetching meeting data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetingStates();
        fetchMeetingData();
    }, []);

    const handleStatusChange = async (e, meetingId, idx) => {
        const newStatusName = e.target.value;
        const selectedStatus = meetingStates.find((state) => state.name === newStatusName);

        try {
            const response = await fetch(`${config.apiBaseUrl}/meeting/update/${meetingId}`, {
                method: "PUT",
                headers: {
                    ...config.getHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    state: newStatusName,
                }),
            });

            if (!response.ok) {
                throw new Error("Échec de la mise à jour du statut");
            }

            let newInvoice = null;
            const meeting = meetingData[idx];

            if (newStatusName === "completed" && !meeting.invoice) {
                const billResponse = await fetch(`${config.apiBaseUrl}/bill/create`, {
                    method: "POST",
                    headers: {
                        ...config.getHeaders(),
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ meeting: meetingId }),
                });

                if (!billResponse.ok) {
                    throw new Error("Erreur lors de la création de la facture");
                }

                const json = await billResponse.json();
                newInvoice = json.bill;
            }

            setSnackbar("Statut de rendez-vous mis à jour.");

            setMeetingData((prevData) =>
                prevData.map((m, i) =>
                    i === idx
                        ? {
                            ...m,
                            meetingState: selectedStatus,
                            invoice: newInvoice || m.invoice,
                        }
                        : m
                )
            );
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du statut du meeting ${meetingId} :`, error);
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    return (
        <Box className="w-full">
            <PageHeader
                title={"Mes rendez-vous"}
                description={"Consultez l'historique de vos rendez-vous"}
                backgroundImage={"/garage1.jpg"}
            />
            {loading ? (
                <div className="flex justify-center items-center h-[60vh]">
                    <Loader />
                </div>
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
                            <th>Devis</th>
                            <th>Modifier le statut</th>
                            <th>Facture</th>
                        </tr>
                        </thead>
                        <tbody>
                        {meetingData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    Aucune opération effectuée
                                </td>
                            </tr>
                        ) : (
                            meetingData.map((meeting, idx) => (
                                <MeetingRow
                                    key={meeting.id}
                                    meeting={meeting}
                                    idx={idx}
                                    meetingStates={meetingStates}
                                    handleStatusChange={handleStatusChange}
                                />
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}
            <Snackbar
                open={Boolean(snackbar)}
                autoHideDuration={3000}
                onClose={() => setSnackbar("")}
                message={snackbar}
            />
        </Box>
    );
};

export default MeetingGrid;