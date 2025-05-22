import React, { createContext, useState, useEffect } from "react";
import config from "../providers/apiConfig.js";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [nearestGarage, setNearestGarage] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });

                    try {
                        const response = await fetch(`${config.apiBaseUrl}/garage/nearby`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                longitude,
                                latitude,
                            }),
                        });
                        const garages = await response.json();
                        if (garages.length > 0) setNearestGarage(garages[0]);
                    } catch (error) {
                        console.error("Erreur récupération garage proche :", error);
                    }
                },
                (error) => {
                    console.error("Erreur récupération localisation :", error);
                }
            );
        } else {
            console.error("La géolocalisation n'est pas supportée.");
        }
    }, []);

    return (
        <LocationContext.Provider value={{ location, nearestGarage }}>
            {children}
        </LocationContext.Provider>
    );
};
