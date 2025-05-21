import {useEffect, useState} from "react";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import Loader from "../../components/Loader.jsx";
import config from "../../providers/apiConfig.js";
import {PageHeader} from "../../components/index.js";

const Garages = () => {
    const [garages, setGarages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGarages = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/garage/list`);
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des garages");
                }
                const data = await response.json();
                setGarages(data);
            } catch (error) {
                console.error("Erreur :", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGarages();
    }, []);

    return (
        <div className="w-full">
            <PageHeader
                title={"Nos garages"}
                description={"Découvrez nos garages partenaires et leurs services"}
                backgroundImage={"/garage1.jpg"}
            />
            {loading ? (
                <Loader/>
            ) : (
                <div className="flex flex-col items-center justify-center overflow-auto h-full w-full">
                    <MapContainer
                        center={[46.603354, 1.888334]}
                        zoom={6}
                        style={{height: "500px", width: "80%"}}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {garages.map((garage) => (
                            ((garage.latitude && garage.longitude) &&
                                <Marker
                                    key={garage.id}
                                    position={[garage.latitude, garage.longitude]}
                                >
                                    <Popup>
                                        <strong>{garage.name}</strong>
                                        <br/>
                                        {garage.address}
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default Garages;