import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import config from "../../providers/apiConfig.js";

const TakeMeeting = () => {
    const [quotations, setQuotations] = useState([]);
    const [selectedQuotationId, setSelectedQuotationId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState("");

    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: 48 * 8 + 5,
                width: 250,
            },
        },
    };

    const client = JSON.parse(localStorage.getItem("client"));

    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/quotation/client`, {
                    headers: config.headers,
                });
                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}`);
                }
                const data = await response.json();
                setQuotations(data);
                if (data.length > 0) setSelectedQuotationId(data[0].id);
            } catch (error) {
                setError(error.message);
                console.error("Erreur lors de la récupération des devis :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuotations();

    }, []);

    const handleCreateMeeting = async () => {
        try {
            if (!selectedQuotation) {
                throw new Error("Aucun devis sélectionné");
            }

            const existingMeetingsResponse = await fetch(
                `${config.apiBaseUrl}/meeting/client/${client.id}`,
                { headers: config.headers }
            );

            if (!existingMeetingsResponse.ok) {
                throw new Error(`Erreur ${existingMeetingsResponse.status} lors de la récupération des meetings`);
            }

            const existingMeetings = await existingMeetingsResponse.json();

            const meetingExists = existingMeetings.some(
                (meeting) => meeting.quotation === selectedQuotation.id
            );

            if (meetingExists) {
                setSnackbar("Un rendez-vous existe déjà pour ce devis.");
                return;
            }

            // 2. Création du meeting
            const payload = {
                vehicle: selectedQuotation.vehicle.id,
                quotation: selectedQuotation.id,
                garage: selectedQuotation.garage.id,
                meeting_state: 1,
                date: selectedQuotation.date ?? new Date().toISOString(),
            };

            const response = await fetch(`${config.apiBaseUrl}/meeting/create`, {
                method: "POST",
                headers: config.headers,
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            setSnackbar("Rendez-vous créé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la création du rendez-vous :", error);
            setSnackbar(error.message || "Erreur lors de la création du rendez-vous.");
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) return <Typography color="error">{error}</Typography>;

    const selectedQuotation = quotations.find(
        (q) => q.id === selectedQuotationId
    );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Créer une réunion à partir d’un devis
            </Typography>

            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel id="select-quotation-label">Choisir un devis</InputLabel>
                <Select
                    labelId="select-quotation-label"
                    value={selectedQuotationId}
                    label="Choisir un devis"
                    onChange={(e) => setSelectedQuotationId(e.target.value)}
                    MenuProps={MenuProps}
                >
                    {quotations.map((quotation) => (
                        <MenuItem key={quotation.id} value={quotation.id}>
                            Devis #{quotation.id} - {Math.round(quotation.price * (1 + parseFloat(quotation.tva)))} €
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {selectedQuotation && (
                <Card>
                    <CardContent>
                        <Typography variant="h6">Devis #{selectedQuotation.id}</Typography>

                        <Typography variant="body2" color="text.secondary">
                            <strong>Prix :</strong>{" "}
                            {Math.round(
                                selectedQuotation.price *
                                (1 + parseFloat(selectedQuotation.tva))
                            )}{" "}
                            €
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            <strong>Date de rendez-vous souhaitée :</strong>{" "}
                            {selectedQuotation.requestDate
                                ? new Date(selectedQuotation.requestDate).toLocaleDateString(
                                    "fr-FR",
                                    {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    }
                                )
                                : "Non définie"}
                        </Typography>

                        <Box display="flex" justifyContent="center" gap={2} mt={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                component="a"
                                href={`${config.baseUrl}/uploads/quotations/${selectedQuotation.hash}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Télécharger le devis
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateMeeting}
                            >
                                Prendre le rendez-vous
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
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

export default TakeMeeting;
