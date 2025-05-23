import React from 'react';
import {useNavigate} from "react-router-dom";
import { LocationContext } from "../../components/LocationContext.jsx";
import {
    Checkbox,
    FormControlLabel,
    FormGroup,
    Select,
    FormControl,
    InputLabel,
    MenuItem,
    Typography,
    Button,
    StepLabel,
    Box,
    Stepper,
    Step,
    Snackbar
} from "@mui/material";
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from "date-fns/locale/fr"; // French displaying
import config from "../../providers/apiConfig.js";


const steps = ['Identifiez votre véhicule', 'Choix de l\'atelier', 'Votre panier', 'Votre rendez-vous', 'Récapitulatif']

const client = JSON.parse(localStorage.getItem("client"));

const Rdv = () => {

    const navigate = useNavigate();

    const { location, nearestGarage } = React.useContext(LocationContext);

    // Value to acknowledge which step is the current one
    const [activeStep, setActiveStep] = React.useState(0);

    // Form datas
    const [formData, setFormData] = React.useState({
        vehiclePlate: [],
        place:'',
        category: [],
        cart:[],
        meetingTime: null,
    });

    // Errors
    const [errors, setErrors] = React.useState({
        vehiclePlate: '',
        place:'',
        category: [],
        cart:'',
        meetingTime: '',
    });

    const [clientVehicles, setClientVehicles] = React.useState([]);
    const [vehicleLoadError, setVehicleLoadError] = React.useState(null);

    const [nearByGarages, setNearByGarages] = React.useState([]);
    const [nearByGaragesError, setNearByGaragesError] = React.useState(null);

    const [categories, setCategories] = React.useState([]);
    const [categoriesError, setCategoriesError] = React.useState(null);

    const [operations, setOperations] = React.useState([]);

    const [quotationHash, setQuotationHash] = React.useState(null);
    const [quotationId, setQuotationId] = React.useState(null);

    const [noVehicles, setNoVehicles] = React.useState(false);

    const [meetingStates, setMeetingStates] = React.useState([]);

    const hasFetchedData = React.useRef(false);

    React.useEffect(() => {

        if (!location || hasFetchedData.current) return;

        const fetchMeetingStates = async () => {
            try {
                const res = await fetch(`${config.apiBaseUrl}/meetingstate/list`, {
                    headers: config.getHeaders(),
                });
                if (!res.ok) throw new Error("Erreur chargement des statuts");
                const data = await res.json();
                setMeetingStates(data);
            } catch (error) {
                console.error("Erreur récupération des statuts :", error);
            }
        };

        //  Fetching vehicle(s) based on clientId
        const fetchVehicles = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/vehicle/client/${client.id}`, {
                    headers: config.getHeaders(),
                });

                // No vehicles
                if (response.status === 404) {
                    setNoVehicles(true);
                    setClientVehicles([])
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}`);
                }

                const data = await response.json();
                setClientVehicles(data);
                setNoVehicles(false);

            } catch (error) {
                setVehicleLoadError(error);
                console.error("Erreur lors de la récupération des véhicules :", error);
            }
        };

        const fetchGarages = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/garage/nearby`,
                    {
                        method: 'POST',
                        headers: config.getHeaders(),
                        body: JSON.stringify(
                            {
                                "longitude": location.longitude,
                                "latitude": location.latitude,
                                "radius": -1
                            }
                        )
                    });

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}`);
                }

                const data = await response.json();
                setNearByGarages(data);

            } catch (error) {
                setNearByGaragesError(error);
                console.error("Erreur lors de la récupération des garages proches :", error);
            }

        }

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/operations/category/list`,
                    {
                        method: 'GET',
                        headers: config.getHeaders(),
                    });

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}`);
                }

                const data = await response.json();
                setCategories(data);

            } catch (error) {
                setCategoriesError(error);
                console.error("Erreur lors de la récupération des opérations :", error);
            }
        }

        const fetchData = async () => {
            await Promise.all([
                fetchVehicles(),
                fetchGarages(),
                fetchCategories(),
                fetchMeetingStates(),
            ]);
        };

        fetchData();

    }, [location]);



    // Update form value based on field
    const handleChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    // Fetch content based on which step is active
    const getStepContent = (step) => {
        switch (step){
            case 0:
                return (
                    <FormControl fullWidth>
                        <InputLabel id="vehicle-select-label">Choisissez un véhicule</InputLabel>
                        <Select
                            labelId="vehicle-select-label"
                            id="vehicle-select"
                            value={formData.vehiclePlate}
                            onChange={handleChange('vehiclePlate')}
                            error={!!errors.vehiclePlate}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 48 * 5,
                                        overflowY: 'auto',
                                    },
                                },
                            }}
                        >

                            {clientVehicles.map((vehicle) => (
                                <MenuItem key={vehicle.id} value={vehicle.registrationNumber}>
                                    {vehicle.registrationNumber} – {vehicle.brand.name} {vehicle.model.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.vehiclePlate && (
                            <Typography variant="caption" color="error">{errors.vehiclePlate}</Typography>
                        )}
                        {vehicleLoadError && (
                            <Typography variant="caption" color="error">{vehicleLoadError}</Typography>
                        )}
                    </FormControl>
                );
            case 1:
                return (
                    <FormControl fullWidth>
                        <InputLabel id="place-label">Choisissez un atelier</InputLabel>
                        <Select
                            labelId="place-select-label"
                            id="place-select"
                            value={formData.place}
                            onChange={handleChange('place')}
                            error={!!errors.place}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 48 * 5,
                                        overflowY: 'auto',
                                    },
                                },
                            }}
                        >
                            {nearByGarages.slice(0, 50).map((garage) => (
                                <MenuItem key={garage.id} value={garage.id}>
                                    {garage.name} – {garage.zipcode} {garage.city}
                                </MenuItem>
                            ))}
                        </Select>

                        {nearByGaragesError && (
                            <Typography variant="caption" color="error">{nearByGaragesError}</Typography>
                        )}
                    </FormControl>
                );
            case 2:
                return (
                    <FormControl fullWidth>
                        <InputLabel id="category-label">Choisissez une catégorie de maintenance</InputLabel>
                        <Select
                            labelId="category-select-label"
                            id="category-select"
                            value={formData.category}
                            onChange={async (event) => {
                                const selectedCategoryId = event.target.value;
                                setFormData({ ...formData, category: selectedCategoryId, cart: [] });

                                try {
                                    const response = await fetch(`${config.apiBaseUrl}/operations/category/${selectedCategoryId}`, {
                                        headers: config.getHeaders(),
                                    });

                                    if (!response.ok) {
                                        throw new Error(`Erreur ${response.status}`);
                                    }

                                    const data = await response.json();
                                    setOperations(data);
                                } catch (error) {
                                    console.error("Erreur lors du chargement des opérations :", error);
                                    setOperations([]);
                                }
                            }}
                            error={!!errors.category}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 48 * 5,
                                        overflowY: 'auto',
                                    },
                                },
                            }}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>

                        {operations.length > 0 && (
                            <FormGroup className="mt-4">
                                {operations.map((op) => (
                                    <FormControlLabel
                                        key={op.id}
                                        control={
                                            <Checkbox
                                                checked={formData.cart.some(item => item.libelle === op.libelle)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData((prev) => {
                                                        let updatedCart;
                                                        if (checked) {
                                                            updatedCart = [...prev.cart, { libelle: op.libelle, price: op.price }];
                                                        } else {
                                                            updatedCart = prev.cart.filter(item => item.libelle !== op.libelle);
                                                        }
                                                        return { ...prev, cart: updatedCart };
                                                    });

                                                    if (errors.cart) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            cart: '',
                                                        }));
                                                    }
                                                }}

                                                name={op.libelle}
                                            />
                                        }
                                        label={op.libelle}
                                    />
                                ))}
                                {errors.cart && (
                                    <Typography variant="caption" color="error">{errors.cart}</Typography>
                                )}
                            </FormGroup>
                        )}

                        {categoriesError && (
                            <Typography variant="caption" color="error">{categoriesError}</Typography>
                        )}
                    </FormControl>
                );
            case 3:
                { const generateTimeSlots = (startDate, endDate) => {
                    const slots = [];
                    if (startDate && endDate && startDate <= endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                            for (let h = 8; h < 18; h++) {
                                const dateTime = new Date(d);
                                dateTime.setHours(h, 0, 0, 0); // heures pleines uniquement
                                slots.push(new Date(dateTime));
                            }
                        }
                    }
                    return slots;
                };

                    const generateDateTimeOptions = () => {
                        const options = [];
                        if (formData.startDate && formData.endDate && formData.startDate <= formData.endDate) {
                            const timeSlots = generateTimeSlots(formData.startDate, formData.endDate);
                            timeSlots.forEach((dateTime) => {
                                options.push(dateTime);
                            });
                        }
                        return options;
                    };


                return (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <Box display="flex" gap={2}>
                                <DatePicker
                                    label="Chercher au plus tôt"
                                    value={formData.startDate || null}
                                    onChange={(newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            startDate: newValue,
                                            meetingTime: null
                                        }));
                                    }}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                                <DatePicker
                                    label="Chercher au plus tard"
                                    value={formData.endDate || null}
                                    onChange={(newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            endDate: newValue,
                                            meetingTime: null
                                        }));
                                    }}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                            </Box>

                            {errors.dateRange && (
                                <Typography variant="caption" color="error">
                                    {errors.dateRange}
                                </Typography>
                            )}

                            {formData.startDate && formData.endDate && formData.startDate <= formData.endDate && (
                                <FormControl fullWidth>
                                    <InputLabel id="time-slot-label">Choisissez un créneau</InputLabel>
                                    <Select
                                        labelId="time-slot-label"
                                        value={formData.meetingTime ? formData.meetingTime.toISOString() : ''}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 48 * 5,
                                                    overflowY: 'auto',
                                                },
                                            },
                                        }}
                                        onChange={(e) => {
                                            const selectedDate = new Date(e.target.value);
                                            setFormData((prev) => ({
                                                ...prev,
                                                meetingTime: selectedDate,
                                            }));
                                        }}
                                    >
                                        {generateDateTimeOptions().map((dt, index) => (
                                            <MenuItem key={index} value={dt.toISOString()}>
                                                {dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                    </LocalizationProvider>
                ); }

            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Récapitulatif de votre demande</Typography>
                        <Typography>
                            <strong>Immatriculation :</strong> {formData.vehiclePlate}
                        </Typography>
                        <Typography>
                            <strong>Atelier choisi :</strong> {
                            (() => {
                                const g = nearByGarages.find(garage => garage.id === formData.place);
                                return g ? `${g.name} – ${g.zipcode} ${g.city}` : "Non sélectionné";
                            })()
                        }
                        </Typography>
                        <Typography>
                            <strong>Opérations choisies :</strong> {
                            formData.cart.length > 0
                                ? formData.cart.map(op => `${op.libelle} (${op.price} €)`).join(', ')
                                : "Aucune"
                        }
                        </Typography>
                        <Typography>
                            <strong>Rendez-vous :</strong> {formData.meetingTime ? formData.meetingTime.toLocaleString('fr-FR') : "Non sélectionné"}
                        </Typography>
                        <Typography>
                            <strong>Total HT :</strong> {
                            (() => formData.cart.reduce((sum, op) => sum + op.price, 0))()
                        } €
                        </Typography>
                        <Typography>
                            <strong>Montant TVA (20%) :</strong> {
                            (() => {
                                const totalHT = formData.cart.reduce((sum, op) => sum + op.price, 0);
                                return (totalHT * 0.2).toFixed(2);
                            })()
                        } €
                        </Typography>
                    </Box>
                );

            default:
                return "Erreur : Impossible de charger l'onglet du formulaire."
        }

    }

    // Check on submit if step is complete, if not, error is written
    const checkStepComplete = (step) => {
        let valid = true;

        switch (step) {
            case 0:
                if (!formData.vehiclePlate) {
                    setErrors((prev) => ({
                        ...prev,
                        vehiclePlate: "Veuillez sélectionner un véhicule.",
                    }));
                    valid = false;
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        vehiclePlate: '',
                    }));
                }
                break;
            case 1 :
                if (!formData.place) {
                    setErrors((prev) => ({
                        ...prev,
                        place: "Veuillez choisir un atelier.",
                    }));
                    valid = false;
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        place: '',
                    }));
                }
                break;
            case 2:
                if (formData.cart.length === 0) {
                    setErrors((prev) => ({
                        ...prev,
                        cart: "Veuillez sélectionner au moins une opération.",
                    }));
                    valid = false;
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        cart: '',
                    }));
                }
                break;
            case 3:
                if (!formData.startDate || !formData.endDate) {
                    setErrors((prev) => ({
                        ...prev,
                        dateRange: "Veuillez sélectionner une date de début et une date de fin.",
                    }));
                    valid = false;
                } else if (formData.startDate > formData.endDate) {
                    setErrors((prev) => ({
                        ...prev,
                        dateRange: "La date de début ne peut pas être après la date de fin.",
                    }));
                    valid = false;
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        dateRange: '',
                    }));
                }
                if (!formData.meetingTime) {
                    setErrors((prev) => ({
                        ...prev,
                        dateRange: "Veuillez sélectionner un créneau horaire.",
                    }));
                    valid = false;
                }
                break;
            default:
                break;
        }

        return valid;
    }


    // Go to next step
    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            try {
                const tvaRate = 0.2;

                // Fetch libs in cart
                const selectedLibelles = formData.cart.map(item => item.libelle);

                const selectedOperations = operations.filter(op =>
                    selectedLibelles.includes(op.libelle)
                );

                const totalPrice = selectedOperations.reduce((total, op) => total + op.price, 0);

                const operationsString = selectedOperations.map(op => op.id).join(';');

                // Fetch vehicle id
                const selectedVehicle = clientVehicles.find(
                    v => v.registrationNumber === formData.vehiclePlate
                );

                if (!selectedVehicle) {
                    throw new Error("Véhicule non trouvé");
                }

                const body = {
                    price: Math.round(totalPrice),
                    tva: tvaRate,
                    operations: operationsString,
                    date: formData.meetingTime
                        ? `${formData.meetingTime.getFullYear()}-${String(formData.meetingTime.getMonth() + 1).padStart(2, '0')}-${String(formData.meetingTime.getDate()).padStart(2, '0')} ${String(formData.meetingTime.getHours()).padStart(2, '0')}:${String(formData.meetingTime.getMinutes()).padStart(2, '0')}:00`
                        : null,
                    vehicle: selectedVehicle.id,
                    garage: formData.place
                };
                const response = await fetch(`${config.apiBaseUrl}/quotation/create`, {
                    method: 'POST',
                    headers: config.getHeaders(),
                    body: JSON.stringify(body)
                });

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}`);
                }

                const quotationData = await response.json();

                setQuotationHash(quotationData.hash);
                setQuotationId(quotationData.id);

                setActiveStep((prevActiveStep) => prevActiveStep + 1);

            } catch (error) {

                console.error("Erreur lors de la création du devis :", error);
            }

        } else {
            if (checkStepComplete(activeStep)) {
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
            }
        }
    };

    const handleCreateMeeting = async () => {
        try {
            const selectedVehicle = clientVehicles.find(
                (v) => v.registrationNumber === formData.vehiclePlate
            );

            if (!selectedVehicle) {
                throw new Error("Véhicule non trouvé.");
            }

            const meetingDate = formData.meetingTime
                ? `${formData.meetingTime.getFullYear()}-${String(
                    formData.meetingTime.getMonth() + 1
                ).padStart(2, "0")}-${String(formData.meetingTime.getDate()).padStart(
                    2,
                    "0"
                )} ${String(formData.meetingTime.getHours()).padStart(2, "0")}:${String(
                    formData.meetingTime.getMinutes()
                ).padStart(2, "0")}:00`
                : null;

            const createdState = meetingStates.find((state) => state.name === "created");
            if (!createdState) {
                throw new Error("Statut 'created' non trouvé");
            }

            const body = {
                vehicle: selectedVehicle.id,
                quotation: quotationId,
                garage: formData.place,
                meeting_state_id: createdState.id,
                date: meetingDate,
            };

            const response = await fetch(`${config.apiBaseUrl}/meeting/create`, {
                method: 'POST',
                headers: config.getHeaders(),
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de la création du rendez-vous : ${response.status}`);
            }

            const data = await response.json();
            
            navigate("../meeting");
        } catch (error) {
            console.error("Erreur création rendez-vous :", error);
        }
    };

    // Go back to previous step
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Box className="m-20 bg-white p-10">

            {noVehicles ? (
                <Box textAlign="center" p={5}>
                    <Typography variant="h6" mb={3}>
                        Vous n'avez aucun véhicule. Commencez par créer un véhicule pour obtenir votre devis.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.location.href = '/profile'}
                    >
                        Créer un véhicule
                    </Button>
                </Box>
            ) : (
                <>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            <Typography className="text-green-800 pt-10">
                                Votre demande a bien été prise en compte.
                            </Typography>
                            {quotationHash ? (
                                <Box className="mt-6 space-y-4">
                                    <iframe
                                        src={`${config.baseUrl}/uploads/quotations/${quotationHash}.pdf`}
                                        width="100%"
                                        height="600px"
                                        title="Aperçu du devis"
                                    />
                                    <Box display="flex" justifyContent="center" gap={2.5}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            component="a"
                                            href={`${config.baseUrl}/uploads/quotations/${quotationHash}.pdf`}
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
                                            Prendre rendez-vous
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Typography color="error">Une erreur est survenue lors du chargement du devis PDF.</Typography>
                            )}
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <Box className="my-10">{getStepContent(activeStep)}</Box>
                            <Box className="flex justify-center">
                                <Button disabled={activeStep === 0} onClick={handleBack}>
                                    Précédent
                                </Button>
                                <Box />
                                <Button onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Valider' : 'Suivant'}
                                </Button>
                            </Box>
                        </React.Fragment>
                    )}
                </>
            )}
        </Box>
    );

};

export default Rdv;