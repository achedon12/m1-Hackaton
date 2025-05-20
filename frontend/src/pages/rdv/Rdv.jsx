import React from 'react';
import {Checkbox, FormControlLabel, FormGroup, Select, FormControl, InputLabel, MenuItem, Typography, Button, StepLabel, Box, Stepper, Step} from "@mui/material";
import {LocalizationProvider, DatePicker} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from "date-fns/locale/fr"; // French displaying


const steps = ['Identifiez votre véhicule', 'Choix de l\'atelier', 'Votre panier', 'Votre rendez-vous', 'Récapitulatif']

const Rdv = () => {

    // Value to acknowledge which step is the current one
    const [activeStep, setActiveStep] = React.useState(0);

    // Form datas
    const [formData, setFormData] = React.useState({
        vehiclePlate: '',
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

    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NDc3NDgzNTksImV4cCI6MTc0Nzc1MTk1OSwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoiamVhbi5kdXBvbnQ2QGV4YW1wbGUuY29tIn0.G6oIU9MgreUWUyD38YTZW7vhtis3xWC-ndgDATB4XKH4MmaktYhvDCVz9vfh6z3mBBlggLnilt86M1geXuYCJddLrpTmCenRNJ8VHYm7uPf827YNJxPOjQgSYMe0nYfyVqs8ySz-j3Lih8slHRonk4wXCEv6LTyqhxiCfkUno3cdeXmRfQHtycQpQL3NS2-Hnfb74DRgQ44q5l0VARNQkDcYCDVD2q6lrLxcUJ0C-OfIR-kQy1V4rLk1p0uN937RO057wXNPTSdK5ybA1_GD2bgDnkhztaaKq4ll9bLVFe0BKZhlJZse6KhKVIVSWqJezxpGP0vdU2aKNH6MDkThhQ"
    const [clientVehicles, setClientVehicles] = React.useState([]);
    const [vehicleLoadError, setVehicleLoadError] = React.useState(null);

    const [nearByGarages, setNearByGarages] = React.useState([]);
    const [nearByGaragesError, setNearByGaragesError] = React.useState(null);

    const [categories, setCategories] = React.useState([]);
    const [categoriesError, setCategoriesError] = React.useState(null);

    const [operations, setOperations] = React.useState([]);

    React.useEffect(() => {

        //  Fetching vehicle(s) based on clientId
        const fetchVehicles = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/vehicle/client/3", // TODO : CHANGE IP
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json"
                        }
                    });

                if (!response.ok) {
                    throw new Error(`Erreur ${response.status}`);
                }

                const data = await response.json();
                setClientVehicles(data);

            } catch (error) {
                setVehicleLoadError(error);
                console.error("Erreur lors de la récupération des véhicules :", error);
            }
        };

        const fetchGarages = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/garage/nearby", // TODO : CHANGE IP + USE DYNAMIC COORDS
                    {
                        method: 'POST',
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(
                            {
                                "longitude": 45.74,
                                "latitude": 4.87,
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
                const response = await fetch("http://127.0.0.1:8000/api/operations/category/list", // TODO : CHANGE IP
                    {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Accept": "application/json",
                        }
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

        fetchVehicles();
        fetchGarages();
        fetchCategories();

    }, []);



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
                                    const response = await fetch(`http://127.0.0.1:8000/api/operations/category/${selectedCategoryId}`, {
                                        headers: {
                                            "Authorization": `Bearer ${token}`,
                                            "Accept": "application/json"
                                        }
                                    });

                                    if (!response.ok) {
                                        throw new Error(`Erreur ${response.status}`);
                                    }

                                    const data = await response.json();
                                    setOperations(data); // data doit être un tableau d'opérations
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
                                                checked={formData.cart.includes(op.libelle)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setFormData((prev) => {
                                                        const updatedCart = checked
                                                            ? [...prev.cart, op.libelle]
                                                            : prev.cart.filter((item) => item !== op.libelle);
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
                return (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                        <Box display="flex" gap={2}>
                            <DatePicker
                                label="Chercher au plus tôt"
                                value={formData.startDate || null}
                                onChange={(newValue) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        startDate: newValue,
                                    }));

                                    // Reset error when startDate is valid
                                    if (formData.endDate && newValue > formData.endDate) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            dateRange: "La date de début ne peut pas être après la date de fin.",
                                        }));
                                    } else {
                                        setErrors((prev) => ({
                                            ...prev,
                                            dateRange: '',
                                        }));
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                }}
                            />

                            <DatePicker
                                label="Chercher au plus tard"
                                value={formData.endDate || null}
                                onChange={(newValue) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        endDate: newValue,
                                    }));

                                    // Reset error when endDate is valid
                                    if (formData.startDate && newValue < formData.startDate) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            dateRange: "La date de fin ne peut pas être avant la date de début.",
                                        }));
                                    } else {
                                        setErrors((prev) => ({
                                            ...prev,
                                            dateRange: '',
                                        }));
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </Box>

                        {errors.dateRange && (
                            <Typography variant="caption" color="error">
                                {errors.dateRange}
                            </Typography>
                        )}
                    </LocalizationProvider>
                );

            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Récapitulatif de votre demande</Typography>
                        <Typography><strong>Immatriculation :</strong> {formData.vehiclePlate}</Typography>
                        <Typography><strong>Atelier choisi :</strong> {
                            (() => {
                                const selectedGarage = nearByGarages.find(g => g.id === formData.place);
                                return selectedGarage ? `${selectedGarage.name} – ${selectedGarage.zipcode} ${selectedGarage.city}` : "Non sélectionné";
                            })()
                        }</Typography>

                        <Typography><strong>Opérations choisies :</strong> {formData.cart.length > 0 ? formData.cart.join(', ') : "Aucune"}</Typography>
                        <Typography><strong>Rendez-vous :</strong> {formData.meetingTime ? formData.meetingTime.toLocaleString('fr-FR') : "Non sélectionné"}</Typography>
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
                break;
            default:
                break;
        }

        return valid;
    }


    // Go to next step
    const handleNext = () => {
        if (checkStepComplete(activeStep)) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    // Go back to previous step
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };


    return (
        <Box className="m-20 bg-white p-10">
            <Stepper activeStep={activeStep}>
                {steps.map((label) => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            {activeStep === steps.length ? (
                <React.Fragment>
                    <Typography className="text-green-800 pt-10">
                        Votre demande a bien été prise en compte.
                    </Typography>
                    <Box>
                        <Box/>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <Box className="my-10">{getStepContent(activeStep)}</Box>
                    <Box className="flex justify-center">
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                        >
                            Précédent
                        </Button>
                        <Box/>
                        <Button onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Valider' : 'Suivant'}
                        </Button>
                    </Box>
                </React.Fragment>
            )}
        </Box>
    );
};

export default Rdv;