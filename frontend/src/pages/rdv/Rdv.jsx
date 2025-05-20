import React from 'react';
import {Checkbox, FormControlLabel, FormGroup, Select, TextField, FormControl, InputLabel, MenuItem, Typography, Button, StepLabel, Box, Stepper, Step} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from "date-fns/locale/fr"; // Pour affichage en français


const steps = ['Identifiez votre véhicule', 'Choix de l\'atelier', 'Votre panier', 'Votre rendez-vous', 'Récapitulatif']

const Rdv = () => {

    // Value to acknowledge which step is the current one
    const [activeStep, setActiveStep] = React.useState(0);

    // Form datas
    const [formData, setFormData] = React.useState({
        vehiclePlate: '',
        place:'',
        cart:[],
        meetingTime: null,
    });

    // Errors
    const [errors, setErrors] = React.useState({
        vehiclePlate: '',
        place:'',
        cart:'',
        meetingTime: '',
    });


    // Update form value based on field
    const handleChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    // Handle updates on chosen options
    const handleCheckboxChange = (value) => () => {
        setFormData((prev) => {
            const current = prev.cart;
            const newCart = current.includes(value)
                ? current.filter((item) => item !== value)
                : [...current, value];
            return { ...prev, cart: newCart };
        });
    };


    // Fetch content based on which step is active
    const getStepContent = (step) => {
        switch (step){
            case 0:
                // TODO : Check if vehicle plate exists in bdd
                return (
                    <FormControl fullWidth>
                        <TextField
                            id="plate"
                            label="Immatriculation de votre véhicule"
                            value={formData.vehiclePlate}
                            onChange={handleChange('vehiclePlate')}
                            error={!!errors.vehiclePlate}
                            helperText={errors.vehiclePlate}
                        />
                    </FormControl>
                );
            case 1:
                // TODO : Load list of possible places based on proximity
                return (
                    <FormControl fullWidth>
                        <InputLabel id="place-label">Choisissez un atelier</InputLabel>
                        <Select
                            labelId="place-label"
                            id="place-select"
                            fullWidth
                            value={formData.place}
                            label="Choisissez un atelier"
                            onChange={handleChange('place')}
                        >
                            <MenuItem value="place1">Atelier de Paris</MenuItem>
                            <MenuItem value="place2">Atelier de Lyon</MenuItem>
                            <MenuItem value="place3">Atelier de Marseille</MenuItem>
                        </Select>
                        {errors.place && (
                            <Typography variant="caption" color="error">{errors.place}</Typography>
                        )}
                    </FormControl>
                );
            case 2:
                // TODO : Load list of possible operations
                return (
                    <>
                        <FormGroup>
                            <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.cart.includes('vidange')}
                                    onChange={handleCheckboxChange('vidange')}
                                />
                            }
                            label="Vidange"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.cart.includes('pneus')}
                                        onChange={handleCheckboxChange('pneus')}
                                    />
                                }
                                label="Pneus"
                            />
                        </FormGroup>
                        {errors.cart && (
                            <Typography variant="caption" color="error">{errors.cart}</Typography>
                        )}
                    </>
                );
            case 3:
                // TODO : Prendre en compte les créneaux déjà pris
                return (
                    <>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale} fullWidth>
                            <DateTimePicker
                                label="Date et heure du rendez-vous"
                                value={formData.meetingTime}
                                onChange={(newValue) => {
                                    setFormData({ ...formData, meetingTime: newValue });
                                    if (errors.meetingTime) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            meetingTime: '',
                                        }));
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        error={!!errors.meetingTime}
                                        helperText={errors.meetingTime}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                        {errors.meetingTime && (
                            <Typography variant="caption" color="error">{errors.meetingTime}</Typography>
                        )}
                    </>
                );

            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Récapitulatif de votre demande</Typography>
                        <Typography><strong>Immatriculation :</strong> {formData.vehiclePlate}</Typography>
                        <Typography><strong>Atelier choisi :</strong> {(() => {
                            switch(formData.place){
                                case 'place1': return "Atelier de Paris";
                                case 'place2': return "Atelier de Lyon";
                                case 'place3': return "Atelier de Marseille";
                                default: return "Non sélectionné";
                            }
                        })()}</Typography>
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
        const immatRegex = /^[A-Z]{2}-\d{3}-[A-Z]{2}$/;
        let valid = true;

        switch (step) {
            case 0:
                if (!immatRegex.test(formData.vehiclePlate)) {
                    setErrors((prev) => ({
                        ...prev,
                        vehiclePlate: "Le format de plaque est invalide. Exemple : AB-123-CD",
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
                if (!formData.meetingTime) {
                    setErrors((prev) => ({
                        ...prev,
                        meetingTime: "Veuillez choisir une date et une heure de rendez-vous.",
                    }));
                    valid = false;
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        meetingTime: '',
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