import React, {useEffect, useRef, useState} from "react";
import config from "../providers/apiConfig.js";
import {Bot, User} from "lucide-react";

const ChatBot = () => {
    const clientId = 8;

    const bottomRef = useRef(null);

    const [messages, setMessages] = useState([
        {from: "bot", text: "Souhaitez-vous prendre un rendez-vous ?"}
    ]);
    const [step, setStep] = useState("start");
    const [userInput, setUserInput] = useState("");
    const [formData, setFormData] = useState({client_id: clientId});
    const [vehicles, setVehicles] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [confirmKms, setConfirmKms] = useState(null);

    const [operations, setOperations] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);

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
                        headers: config.headers,
                        body: JSON.stringify(data_vehicule)
                    });

                    if (res.ok) {
                        appendMessage("bot", "Véhicule créé avec succès !");
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
                const vehicleId = formData.vehicle_id;
                try {
                    const res = await fetch(`${config.apiBaseUrl}/vehicle/update/${vehicleId}`, {
                        method: "PUT",
                        headers: config.headers,
                        body: JSON.stringify({kms: parseInt(val)})
                    });

                    if (res.ok) {
                        appendMessage("bot", "Kilométrage mis à jour avec succès !");
                        setStep("step2");
                    } else {
                        const err = await res.json();
                        appendMessage("bot", `Erreur : ${err.error || "Mise à jour échouée."}`);
                    }
                } catch {
                    appendMessage("bot", "Erreur technique lors de la mise à jour.");
                }
            }
        }
    };

    const fetchBrands = async () => {
        const res = await fetch(`${config.apiBaseUrl}/brand/list`, {
            method: "GET",
            headers: config.headers
        });
        const data = await res.json();
        setBrands(data);
    };

    const fetchModels = async (brandId) => {
        const res = await fetch(`${config.apiBaseUrl}/model/brand/${brandId}`, {
            method: "GET",
            headers: config.headers
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
                    headers: config.headers
                });
                const data = await res.json();
                setVehicles(data);

                if (data.length > 0) {
                    appendMessage("bot", "Voici vos véhicules. Veuillez en choisir un :");
                    setStep("choose_vehicle");
                } else {
                    appendMessage("bot", stepsConfig.ask_registration.question);
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

    const handleVehicleSelect = (vehicleId) => {
        const selected = vehicles.find(v => v.id === vehicleId);
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
                appendMessage("bot", stepsConfig[current.next].question);

                if (current.next === "ask_brand") fetchBrands();

                setStep(current.next);
            }
        }

        setUserInput("");
    };

    const handleSubmit = async () => {
        if (step === "step2") {
            const message = userInput.trim();
            appendMessage("user", message);

            try {
                const res = await fetch(`${config.apiBaseUrl}/operations/analyze`, {
                    method: "POST",
                    headers: config.headers,
                    body: JSON.stringify({ message: message })
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

    return (
        <div className="w-[600px] h-[650px] max-h-[800px] p-4 bg-white shadow rounded flex flex-col">
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
                                    <br />
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
                                appendMessage("bot", stepsConfig.ask_registration.question);
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
                                setStep("rappel_request");
                            }}
                            className="mt-4 text-blue-600 underline hover:text-blue-800"
                        >
                            Je veux envoyer une demande de rappel
                        </button>

                        <button
                            onClick={() => {
                                appendMessage("user", "Voici mes choix");
                                const selected = Object.values(operations).flat().filter(op => selectedOperations.includes(op.id));
                                const summary = selected.map(op => `- ${op.libelle}`).join("\n");
                                appendMessage("bot", `✅ Vous avez sélectionné :\n${summary}`);
                                setStep("summary");
                            }}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        >
                            Confirmer les opérations sélectionnées
                        </button>
                    </div>
                )}

                {step === "rappel_request" && (
                    <div className="mt-4">
                        <p className="mb-2">Un conseiller vous recontactera bientôt. Souhaitez-vous renseigner vos coordonnées maintenant ?</p>
                        {/* Tu peux ajouter ici un formulaire pour nom, email, téléphone */}
                    </div>
                )}
                <div ref={bottomRef} />
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