import React, { useEffect, useRef, useState } from "react";
import config from "../providers/apiConfig.js";

const BotpressChat = () => {
    const client = JSON.parse(localStorage.getItem("client"));
    const [clientVehicles, setClientVehicles] = useState([]);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (!client || hasInitializedRef.current) return;

        const fetchAndInit = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/vehicle/client/${client.id}`, {
                    headers: config.getHeaders(),
                });

                const data = await response.json();
                setClientVehicles(data);

                const clientVehiclesSimplified = data.map(vehicleObject => ({
                    v_id: vehicleObject.id,
                    brand: vehicleObject.brand.name,
                    model: vehicleObject.model.name,
                    circulationDate: vehicleObject.circulationDate,
                    mileageKm: vehicleObject.kms,
                    vin: vehicleObject.vin,
                }));

                console.log(client);
                console.log(clientVehiclesSimplified);

                const script = document.createElement("script");
                script.src = "https://cdn.botpress.cloud/webchat/v2.5/inject.js";
                script.async = true;
                script.onload = () => {
                    window.botpress.init({
                        botId: "552aee85-182b-4a41-a55f-3fe1e1eb51d1",
                        configuration: {
                            composerPlaceholder: "Écrivez votre message ici",
                            botName: "RD-Vroom IA",
                            botAvatar: "https://files.bpcontent.cloud/2025/05/20/13/20250520135832-QND608RS.png",
                            botDescription: "Posez-moi vos demandes !",
                            color: "#cbdeec",
                            variant: "solid",
                            themeMode: "light",
                            fontFamily: "ibm",
                            radius: 4,
                            storageLocation: "sessionStorage"
                        },
                        clientId: "d7b487e3-8fff-4fda-9a7e-17a2b6e48bc1",
                        user: {
                            data: {
                                "firstName": "" + client.firstname,
                                "lastName": "" + client.lastname,
                                "gender": "" + client.gender,
                                "email": "" + client.email,
                                "phone": "" + client.phone,
                                "address": "" + client.address,
                                "city": "" + client.city,
                                "zipcode": "" + client.zipcode,
                                "locationLatitude": "" + client.latitude,
                                "locationLongitude": "" + client.longitude,
                                "societyName": "" + client.societyName,
                                "vehiclesJSON" : JSON.stringify(clientVehiclesSimplified)
                            }
                        }
                    });
                };

                document.body.appendChild(script);
                hasInitializedRef.current = true;
            } catch (error) {
                console.error("Erreur lors de la récupération des véhicules ou de l'initialisation :", error);
            }
        };

        fetchAndInit();
    }, [client]);

    return (
        <div
            id="webchat-container"
            style={{ position: "relative", width: "100%", height: "100%" }}
        />
    );
};

export default BotpressChat;
