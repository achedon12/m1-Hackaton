import React, {useEffect, useRef, useState} from "react";
import config from "../providers/apiConfig.js";
import {Bot, User, FileText} from "lucide-react";

const ChatBot = () => {
    const client = JSON.parse(localStorage.getItem("client"));
    const clientId = client.id;

    const bottomRef = useRef(null);

    const [messages, setMessages] = useState([
        {from: "bot", text: "Souhaitez-vous prendre un rendez-vous ?"}
    ]);
    const [step, setStep] = useState("start");
    const [userInput, setUserInput] = useState("");
    const [requestClient, setRequestClient] = useState("");
    const [formData, setFormData] = useState({client_id: clientId});
    const [vehicles, setVehicles] = useState([]);
    const [vehicleId, setVehicleId] = useState(null);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [confirmKms, setConfirmKms] = useState(null);
    const [zipcode, setZipcode] = useState(client.zipcode);
    const [city, setCity] = useState(client.city);
    const [confirmedZipcode, setConfirmedZipcode] = useState(null);
    const [garages, setGarages] = useState([]);
    const [inputZip, setInputZip] = useState("");
    const [operations, setOperations] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);

    const [quotation, setQuotation] = React.useState(null);
    const [showPdfButton, setShowPdfButton] = React.useState(false);
    const [pendingGarage, setPendingGarage] = React.useState(null);

    const [meetingWithOperations, setMeetingWithOperations] = useState(false);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const appendMessage = (from, text) => {
        setMessages(prev => [...prev, {from, text}]);
    };

    const stepsConfig = {
        ask_registration: {
            question: "Entrez l'immatriculation du véhicule (ex: AB-123-CD) :",
            validate: val => /^[A-Z]{2}-\d{3}-[A-Z]{2}$/i.test(val),
            error: "Format invalide. Entrez une immatriculation comme AB-123-CD.",
            onValid: (val) => setFormData(prev => ({...prev, registration_number: val})),
            next: "ask_brand"
        },
        ask_brand: {
            question: "Choisissez la marque du véhicule :",
            onValid: (val) => {
                const selected = brands.find(b => b.name === val);
                setFormData(prev => ({...prev, brand_id: selected.id}));
                setSelectedBrand(selected.id);
                fetchModels(selected.id);
            },
            next: "ask_model"
        },
        ask_model: {
            question: "Choisissez le modèle du véhicule :",
            onValid: (val) => {
                const selected = models.find(m => m.name === val);
                setFormData(prev => ({...prev, model_id: selected.id}));
                setSelectedModel(selected.id);
            },
            next: "ask_kms"
        },
        ask_kms: {
            question: "Entrez le kilométrage :",
            validate: val => /^\d+$/.test(val),
            error: "Kilométrage invalide. Entrez un nombre.",
            onValid: (val) => setFormData(prev => ({...prev, kms: val})),
            next: "ask_circulation"
        },
        ask_circulation: {
            question: "Entrez la date de mise en circulation (YYYY-MM-DD) :",
            validate: val => /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val)),
            error: "Date invalide. Utilisez le format YYYY-MM-DD.",
            onValid: async (val) => {
                setFormData(prev => ({...prev, circulation_date: val}));
                const data_vehicule = {
                    registrationNumber: formData.registration_number,
                    kms: formData.kms,
                    circulationDate: val,
                    brand: selectedBrand,
                    model: selectedModel
                };

                try {
                    const res = await fetch(`${config.apiBaseUrl}/vehicle/create`, {
                        method: "POST",
                        headers: config.getHeaders(),
                        body: JSON.stringify(data_vehicule)
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setVehicleId(data['vehicule'].id);

                        appendMessage("bot", "Véhicule créé avec succès !");
                        appendMessage("bot", "Veuillez renseigner le problème de votre véhicule :");
                        setStep("step2");
                    } else {
                        const err = await res.json();
                        appendMessage("bot", `Erreur : ${err.error || "Impossible de créer le véhicule."}`);
                    }
                } catch {
                    appendMessage("bot", "Erreur technique lors de la création.");
                }
            }
        },
        update_kms: {
            question: "Veuillez saisir le nouveau kilométrage :",
            validate: val => /^\d+$/.test(val),
            error: "Kilométrage invalide. Entrez un nombre.",
            onValid: async (val) => {
                setVehicleId(formData.vehicle_id);

                try {
                    const res = await fetch(`${config.apiBaseUrl}/vehicle/update/${vehicleId}`, {
                        method: "PUT",
                        headers: config.getHeaders(),
                        body: JSON.stringify({kms: parseInt(val)})
                    });

                    if (res.ok) {
                        appendMessage("bot", "Kilométrage mis à jour avec succès !");
                        appendMessage("bot", "Veuillez renseigner le problème de votre véhicule :");
                        setStep("step2");
                    } else {
                        const err = await res.json();
                        appendMessage("bot", `Erreur : ${err.error || "Mise à jour échouée."}`);
                    }
                } catch {
                    appendMessage("bot", "Erreur technique lors de la mise à jour.");
                }
            }
        },
        ask_zipcode: {
            question: "Entrez un code postal valide (5 chiffres) :",
            validate: val => /^\d{5}$/.test(val),
            error: "Code postal invalide. Entrez 5 chiffres.",
            onValid: async (val) => {
                setZipcode(val);
                await handleConfirmZip(val);
                setStep("garage_list");
            }
        },
        rappel_request: {
            question: () => `Votre code postal est "${zipcode ?? ''}". Souhaitez-vous l'utiliser ?`,
            onValid: async (val) => {
                if (val.toLowerCase() === "oui") {
                    await handleConfirmZip(zipcode);
                    setStep("garage_list");
                } else {
                    appendMessage("bot", "Veuillez entrer un nouveau code postal :");
                    setStep("ask_zipcode");
                }
            }
        },
        garage_unavailable: {
            question: `Souhaitez-vous que le garage ${(pendingGarage?.name ?? "")} vous rappelle dès qu’il est disponible ?`,
            validate: val => ["oui", "non"].includes(val.toLowerCase()),
            error: "Veuillez répondre par oui ou non.",
            onValid: async (val) => {
                if (val.toLowerCase() === "oui") {
                    await handleSelectGarage(pendingGarage.id, pendingGarage.name);
                    setStep("end");
                } else {
                    appendMessage("bot", "Très bien, vous pouvez consulter d'autres garages.");
                    setPendingGarage(null);
                    setStep("garage_list");
                }
            }
        },
        confirm_create_quotation: {
            question: `Voulez-vous créer un devis avec ce garage : ${pendingGarage?.name ?? ''} ?`,
            validate: val => ["oui", "non"].includes(val.toLowerCase()),
            error: "Veuillez répondre par oui ou non.",
            onValid: async (val) => {
                if (val.toLowerCase() === "oui") {
                    if (!pendingGarage) {
                        appendMessage("bot", "Erreur : garage non défini.");
                        setStep("garage_list");
                        return;
                    }
                    await handleCreateQuotation(pendingGarage, selectedOperations);
                    setPendingGarage(null);
                } else {
                    appendMessage("bot", "D'accord, pas de devis créé.");
                    setPendingGarage(null);
                    setStep("garage_list");
                }
            }
        },
        quotation_ready: {
            question: `✅ Devis créé avec succès pour ${(pendingGarage?.name ?? "")}. Voici votre devis :`,
            onValid: () => {
                setStep("ask_meeting");
            }
        },
        ask_meeting: {
            question: `Souhaitez-vous planifier un rendez-vous avec ce garage : ${pendingGarage?.name ?? ''} ?`,
            validate: val => ["oui", "non"].includes(val.toLowerCase()),
            error: "Veuillez répondre par oui ou non.",
            onValid: async (val) => {
                if (val.toLowerCase() === "oui") {
                    appendMessage("bot", "Très bien, procédons à la création du rendez-vous.");
                    await handleMeeting();
                    setStep("end");
                } else {
                    appendMessage("bot", "D'accord, vous pouvez revenir pour le faire plus tard.");
                    setStep("end");
                }
            }
        }
    };

    const fetchBrands = async () => {
        const res = await fetch(`${config.apiBaseUrl}/brand/list`, {
            method: "GET",
            headers: config.getHeaders()
        });
        const data = await res.json();
        setBrands(data);
    };

    const fetchModels = async (brandId) => {
        const res = await fetch(`${config.apiBaseUrl}/model/brand/${brandId}`, {
            method: "GET",
            headers: config.getHeaders()
        });
        const data = await res.json();
        setModels(data);
    };

    const handleStart = async (answer) => {
        appendMessage("user", answer);
        if (answer === "oui") {
            try {
                const res = await fetch(`${config.apiBaseUrl}/vehicle/client/${clientId}`, {
                    method: "GET",
                    headers: config.getHeaders()
                });
                const data = await res.json();
                setVehicles(data);

                if (data.length > 0) {
                    appendMessage("bot", "Voici vos véhicules. Veuillez en choisir un :");
                    setStep("choose_vehicle");
                } else {
                    // appendMessage("bot", stepsConfig.ask_registration.question);
                    setStep("ask_registration");
                }
            } catch {
                appendMessage("bot", "Erreur lors de la récupération des véhicules.");
            }
        } else {
            appendMessage("bot", "D'accord, à bientôt !");
            setStep("end");
        }
    };

    const handleVehicleSelect = (vehicle_id) => {
        const selected = vehicles.find(v => v.id === vehicle_id);
        setVehicleId(vehicle_id)
        appendMessage("user", `${selected.brand.name} ${selected.model.name} (${selected.registrationNumber})`);
        appendMessage("bot", "Véhicule sélectionné.");

        const circulationDate = new Date(selected.circulationDate).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        });

        appendMessage(
            "bot",
            `📄 Informations du véhicule :
- Marque : ${selected.brand.name}
- Modèle : ${selected.model.name}
- Immatriculation : ${selected.registrationNumber}
- VIN : ${selected.vin || "Non renseigné"}
- Kilométrage : ${selected.kms.toLocaleString("fr-FR")} km
- Mise en circulation : ${circulationDate}`
        );

        setFormData(prev => ({...prev, vehicle_id: vehicleId}));
        setStep("confirm_kms"); // 🔑 Assure-toi de cette ligne !
    };

    const handleConfirmZip = async (zip) => {
        setConfirmedZipcode(zip);
        try {
            const url_garages = meetingWithOperations ? `${config.apiBaseUrl}/garage/availabilities` : `${config.apiBaseUrl}/garage/nearbyByZipcode`;

            const operationsIds = selectedOperations.join(";");
            // const operationsIds = selectedOperations.map(op => op.id).join(";");
            const params = meetingWithOperations ? {
                zipcode: zip,
                city: city,
                operations: operationsIds
            } : {zipcode: zip, city: city};

            const response = await fetch(url_garages, {
                method: "POST",
                headers: config.getHeaders(),
                body: JSON.stringify(params),
            });
            const data = await response.json();
            setGarages(data);
            setStep("garage_list");
        } catch (error) {
            console.error("Erreur lors de la récupération des garages :", error);
        }
    };

    const handleSelectGarage = async (garageId, garageName) => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/garage/reminder`, {
                method: "POST",
                headers: config.getHeaders(),
                body: JSON.stringify({garage: garageId, vehicle: vehicleId, message: requestClient}),
            });

            if (res.ok) {
                appendMessage("user", `Je choisis ${garageName}`);
                appendMessage("bot", `${garageName} a bien été sélectionné. Un conseiller vous rappellera.`);
            } else {
                const err = await res.json();
                appendMessage("bot", `Erreur lors de la sélection du garage : ${err.error || "Erreur inconnue"}`);
            }
        } catch (error) {
            appendMessage("bot", "Erreur technique lors de la sélection du garage.");
        }
    };

    const handleCreateQuotation = async (garage, selectedOperations) => {
        try {
            const operationsStr = selectedOperations.join(";");

            const body = {
                operations: operationsStr,
                date: garage.nextAvailableDate || new Date().toISOString().split("T")[0], // sécurité
                vehicle: vehicleId,
                garage: garage.id
            };

            const res = await fetch(`${config.apiBaseUrl}/quotation/create`, {
                method: "POST",
                headers: config.getHeaders(),
                body: JSON.stringify(body),
            });

            if (res.ok) {
                const data = await res.json();
                setQuotation(data)
                setShowPdfButton(true);
                setStep("quotation_ready");
            } else {
                const err = await res.json();
                appendMessage("bot", `❌ Erreur lors de la création du devis : ${err.error || "Erreur inconnue"}`);
                setStep("garage_list");
            }
        } catch (error) {
            console.error(error);
            appendMessage("bot", "⚠️ Erreur technique lors de la création du devis.");
            setStep("garage_list");
        }
    };

    const handleMeeting = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}/meeting/create`, {
                method: "POST",
                headers: config.getHeaders(),
                body: JSON.stringify({
                    quotation: quotation.id,
                    vehicle: vehicleId,
                    date: quotation.requestDate
                })
            });

            if (res.ok) {
                setStep("end");
            } else {
                const err = await res.json();
                appendMessage("bot", `Erreur : ${err.error || "Échec de la création du rendez-vous."}`);
            }
        } catch (error) {
            console.error("Erreur lors de la création du rendez-vous :", error);
            appendMessage("bot", "Erreur technique lors de la création du rendez-vous.");
        }
    };

    const handleFormSteps = async () => {
        const value = userInput.trim();
        const current = stepsConfig[step];

        if (current.validate && !current.validate(value)) {
            appendMessage("user", value);
            appendMessage("bot", current.error);
        } else {
            appendMessage("user", value);
            await current.onValid(value);

            if (current.next && stepsConfig[current.next]) {
                if (current.next === "ask_brand") fetchBrands();

                setStep(current.next);
            }
        }

        setUserInput("");
    };

    const handleSubmit = async () => {
        if (step === "step2") {
            const message = userInput.trim();
            setRequestClient(message);
            appendMessage("user", message);

            try {
                const res = await fetch(`${config.apiBaseUrl}/operations/analyze`, {
                    method: "POST",
                    headers: config.getHeaders(),
                    body: JSON.stringify({message: message})
                });

                const data = await res.json();

                if (data.operations.length === 0) {
                    appendMessage("bot", "Je n’ai pas compris l’opération à effectuer. Pouvez-vous reformuler ?");
                } else {
                    const grouped = groupByCategory(data.operations);
                    setOperations(grouped);
                    appendMessage("bot", "Voici les opérations détectées par catégories, veuillez les sélectionner :");
                    setStep("choose_operations");
                }
            } catch (err) {
                appendMessage("bot", "Une erreur est survenue lors de l'analyse des opérations.");
            }

            setUserInput("");
            return;
        }


        if (!userInput.trim()) return;
        if (step in stepsConfig) {
            handleFormSteps();
        }
    };

    const groupByCategory = (operationsList) => {
        return operationsList.reduce((acc, op) => {
            const cat = op.category?.name || "Autres";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(op);
            return acc;
        }, {});
    };

    useEffect(() => {
        if (!step || !stepsConfig[step]) return;

        const stepData = stepsConfig[step];
        const question = typeof stepData.question === "function" ? stepData.question() : stepData.question;

        if (question) {
            appendMessage("bot", question);
        }
    }, [step]);

    return (
        <div
            className="w-full min-w-[600px] max-w-[800px] h-[72vh] min-h-[400px] max-h-screen p-4 bg-white shadow rounded-lg flex flex-col">
            <div className="flex-1 overflow-y-auto border p-4 mb-2 space-y-3 bg-gray-50 rounded">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.from === "bot" ? "flex-row" : "flex-row-reverse"} items-start gap-2`}
                    >
                        <div className="mt-1">
                            {msg.from === "bot" ? (
                                <Bot className="text-blue-600" size={20}/>
                            ) : (
                                <User className="text-gray-600" size={20}/>
                            )}
                        </div>
                        <div
                            className={`px-3 py-2 rounded-lg max-w-[75%] shadow-sm transition-all
              ${msg.from === "bot"
                                ? "bg-blue-100 text-blue-900 rounded-bl-none animate-fade-in-left"
                                : "bg-gray-200 text-gray-800 rounded-br-none animate-fade-in-right"
                            }`}
                        >
                            {msg.text.split("\n").map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    <br/>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                ))}

                {step === "start" && (
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={() => handleStart("oui")}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            Oui
                        </button>
                        <button
                            onClick={() => handleStart("non")}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Non
                        </button>
                    </div>
                )}

                {step === "choose_vehicle" && (
                    <div className="space-y-2">
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="p-2 bg-white border rounded cursor-pointer hover:bg-gray-100 transition"
                                onClick={() => handleVehicleSelect(vehicle.id)}
                            >
                                {vehicle.brand.name} {vehicle.model.name} ({vehicle.registrationNumber})
                            </div>
                        ))}
                        <div
                            className="text-blue-600 cursor-pointer underline hover:text-blue-800 transition"
                            onClick={() => {
                                setStep("ask_registration");
                            }}
                        >
                            Ou créer un nouveau véhicule
                        </div>
                    </div>
                )}

                {step === "confirm_kms" && (
                    <div className="mt-4">
                        <p>Le kilométrage affiché est-il correct ?</p>
                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={() => {
                                    setConfirmKms(true);
                                    appendMessage("user", "Oui");
                                    appendMessage("bot", "Très bien, on continue.");
                                    appendMessage("bot", "Veuillez renseigner le problème de votre véhicule :");
                                    setStep("step2");
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-300"
                            >
                                Oui
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmKms(false);
                                    appendMessage("user", "Non");
                                    appendMessage("bot", "Merci de renseigner le kilométrage actuel.");
                                    setStep("update_kms");
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-300"
                            >
                                Non
                            </button>
                        </div>
                    </div>
                )}

                {step === "ask_brand" && (
                    <select
                        className="w-full p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={selectedBrand || ""}
                        onChange={(e) => {
                            const selectedId = parseInt(e.target.value);
                            const brand = brands.find(b => b.id === selectedId);
                            if (brand) {
                                setSelectedBrand(brand.id);
                                setUserInput(brand.name);
                            }
                        }}
                    >
                        <option value="">Sélectionnez une marque</option>
                        {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>
                )}

                {step === "ask_model" && (
                    <select
                        className="w-full p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={selectedModel || ""}
                        onChange={(e) => {
                            const selectedId = parseInt(e.target.value);
                            const model = models.find(m => m.id === selectedId);
                            if (model) {
                                setSelectedModel(model.id);
                                setUserInput(model.name);
                            }
                        }}
                    >
                        <option value="">Sélectionnez un modèle</option>
                        {models.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name}
                            </option>
                        ))}
                    </select>
                )}

                {step === "choose_operations" && (
                    <div className="mt-2 space-y-4">
                        {Object.entries(operations).map(([category, ops]) => (
                            <div key={category}>
                                <h4 className="font-semibold text-blue-700 mb-1">{category}</h4>
                                <div className="space-y-1 pl-2">
                                    {ops.map(op => (
                                        <div key={op.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`op-${op.id}`}
                                                checked={selectedOperations.includes(op.id)}
                                                onChange={() => {
                                                    setSelectedOperations(prev =>
                                                        prev.includes(op.id)
                                                            ? prev.filter(id => id !== op.id)
                                                            : [...prev, op.id]
                                                    );
                                                }}
                                            />
                                            <label htmlFor={`op-${op.id}`}>{op.libelle}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => {
                                appendMessage("user", "Je veux être rappelé");
                                appendMessage("bot", "D'accord, nous allons vous recontacter pour définir les réparations.");
                                setMeetingWithOperations(false);
                                setStep("rappel_request");
                            }}
                            className="mt-4 text-blue-600 underline hover:text-blue-800"
                        >
                            Je ne sais pas quoi choisir, veuillez me rappeler
                        </button>

                        <button
                            onClick={() => {
                                appendMessage("user", "Voici mes choix");
                                const selected = Object.values(operations).flat().filter(op => selectedOperations.includes(op.id));
                                const summary = selected.map(op => `- ${op.libelle}`).join("\n");
                                setMeetingWithOperations(true);
                                appendMessage("bot", `✅ Vous avez sélectionné :\n${summary}`);
                                setStep("rappel_request");
                            }}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Confirmer les opérations sélectionnées
                        </button>
                    </div>
                )}

                {step === "rappel_request" && (
                    <div className="flex space-x-2 mt-4">
                        <button
                            className="px-4 py-2 bg-green-600 text-white rounded"
                            onClick={async () => {
                                appendMessage("user", "oui");
                                await stepsConfig.rappel_request.onValid("oui");
                            }}
                        >
                            Oui
                        </button>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded"
                            onClick={async () => {
                                appendMessage("user", "non");
                                await stepsConfig.rappel_request.onValid("non");
                            }}
                        >
                            Non
                        </button>
                    </div>
                )}

                {step === "garage_list" && garages.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {garages.map((garage) => {
                            const isAvailable = garage.available !== false;

                            return (
                                <div
                                    key={garage.id}
                                    className={`border p-3 rounded shadow transition ${
                                        isAvailable ? "border-green-500" : "border-gray-400 bg-gray-100"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{garage.name}</p>
                                        <span
                                            className={`text-sm font-medium px-2 py-1 rounded ${
                                                isAvailable ? "bg-green-200 text-green-800" : "bg-gray-300 text-gray-700"
                                            }`}
                                        >
                            {isAvailable ? "Disponible" : "Indisponible"}
                        </span>
                                    </div>
                                    <p>{garage.address}, {garage.zipcode} {garage.city}</p>
                                    <p>Téléphone : {garage.phone}</p>
                                    <p>Email : {garage.email}</p>
                                    <button
                                        className={`mt-2 px-3 py-1 rounded text-white transition ${
                                            isAvailable
                                                ? "bg-blue-600 hover:bg-blue-700"
                                                : "bg-orange-500 hover:bg-orange-600"
                                        }`}
                                        onClick={() => {
                                            setPendingGarage(garage);
                                            if (isAvailable) {
                                                setStep("confirm_create_quotation");
                                            } else {
                                                setStep("garage_unavailable");
                                                // handleSelectGarage(garage.id, garage.name);
                                            }
                                        }}
                                    >
                                        {isAvailable ? "Sélectionner ce garage" : "Demander à être recontacté"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {step === "garage_unavailable" && (
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={async () => {
                                appendMessage("user", "Oui");
                                await stepsConfig.garage_unavailable.onValid("oui");
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            Oui
                        </button>
                        <button
                            onClick={async () => {
                                appendMessage("user", "Non");
                                await stepsConfig.garage_unavailable.onValid("non");
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                            Non
                        </button>
                    </div>
                )}

                {step === "confirm_create_quotation" && (
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={async () => {
                                if (!pendingGarage) return;

                                appendMessage("user", "Oui");
                                // Appelle la création de devis
                                await handleCreateQuotation(pendingGarage, selectedOperations);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            Oui
                        </button>
                        <button
                            onClick={() => {
                                appendMessage("user", "Non");
                                appendMessage("bot", "D'accord, pas de devis créé.");
                                setPendingGarage(null);
                                setStep("garage_list");
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                            Non
                        </button>
                    </div>
                )}

                {step === "quotation_ready" && quotation?.hash && (
                    <div className="mt-4 space-y-4">
                        <button
                            onClick={() => {
                                const url = `${config.baseUrl}/uploads/quotations/${quotation.hash}.pdf`;
                                window.open(url, "_blank");
                            }}
                            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
                        >
                            <FileText className="w-5 h-5"/>
                            <span>Ouvrir le devis PDF</span>
                        </button>

                        <button
                            onClick={() => {
                                appendMessage("user", "OK");
                                setStep("ask_meeting");
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Continuer
                        </button>
                    </div>
                )}

                {step === "ask_meeting" && showPdfButton && quotation.hash && (
                    <div className="mt-6">
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    appendMessage("user", "Oui");
                                    appendMessage("bot", "Très bien, nous allons planifier un rendez-vous.");
                                    setStep("create_meeting");
                                    handleMeeting();
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                Oui
                            </button>
                            <button
                                onClick={() => {
                                    appendMessage("user", "Non");
                                    appendMessage("bot", "D'accord, n'hésitez pas à revenir si vous changez d'avis.");
                                    setStep("end");
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                            >
                                Non
                            </button>
                        </div>
                    </div>
                )}

                {step === "end" && (
                    <div className="mt-4 text-green-700 font-semibold">
                        Merci pour votre demande. À bientôt !
                    </div>
                )}

                <div ref={bottomRef}/>
            </div>

            {!["choose_vehicle", "start", "end", "ask_brand", "ask_model", "confirm_kms"].includes(step) && (
                <div className="flex gap-2 mt-2">
                    {step === "ask_circulation" ? (
                        <input
                            type="date"
                            className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                        />
                    ) : (
                        <input
                            type="text"
                            className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="Écrivez ici..."
                        />
                    )}
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        Envoyer
                    </button>
                </div>
            )}


            {["ask_brand", "ask_model"].includes(step) && (
                <button
                    onClick={handleSubmit}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    Valider
                </button>
            )}
        </div>
    );
};

export default ChatBot;