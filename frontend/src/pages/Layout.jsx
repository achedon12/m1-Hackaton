import {useState, useEffect} from "react";
import {Outlet, NavLink} from "react-router-dom";
import {ShoppingCart, User, MapPin} from "lucide-react";
import {useAuth} from "../providers/AuthProvider.jsx";
import config from "../providers/apiConfig.js";

const Layout = () => {
    const {isAuthenticated, logout} = useAuth();
    const [location, setLocation] = useState(null);
    const [nearestGarage, setNearestGarage] = useState(null);
    const client = JSON.parse(localStorage.getItem("client"));

    const navItems = [
        {name: "Prestations", path: "/catalog"},
        {name: "Prendre rendez-vous", path: "/rdv"},
    ];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const {latitude, longitude} = position.coords;
                    setLocation({latitude, longitude});

                    try {
                        const response = await fetch(`${config.apiBaseUrl}/garage/nearby`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                longitude: latitude,
                                latitude: longitude
                            }),
                        });
                        const nearestGarage = await response.json();
                        if (nearestGarage.length > 0) {
                            setNearestGarage(nearestGarage[0]);
                        }
                    } catch (error) {
                        console.error("Erreur lors de la récupération du garage le plus proche :", error);
                    }
                },
                (error) => {
                    console.error("Erreur lors de la récupération de la localisation :", error);
                }
            );
        } else {
            console.error("La géolocalisation n'est pas supportée par ce navigateur.");
        }
    }, []);

    return (
        <>
            <header className="navbar shadow-sm md:px-20 lg:px-60 bg-secondary">
                <div className={"flex-1"}>
                    <NavLink to="/" className="btn btn-ghost text-xl text-white">
                        <img src={"logo-white.png"} alt={"logo"} className={"h-8 mr-2 fill-white"}/>
                        <h1 className={"text-xl md:text-2xl text-white"}>
                            RD-Vroum
                        </h1>
                    </NavLink>
                </div>
                <div className="flex-none">
                    <div className="flex items-center gap-4">
                        {location && (
                            <div className="flex items-center text-white">
                                <MapPin className="w-6 h-6 mr-1"/>
                                <span className="text-sm font-bold">
                                {nearestGarage ? nearestGarage.city : "Localisation en cours..."}
                            </span>
                            </div>
                        )}
                        <div className="dropdown dropdown-end">
                            <div tabIndex="0" role="button" className="btn btn-ghost btn-circle">
                                <div className="indicator">
                                    <ShoppingCart className={`text-white`}/>
                                </div>
                            </div>
                        </div>
                        <NavLink to="/login" className={`text-white ${isAuthenticated ? 'hidden' : ''}`}>
                            Se connecter
                        </NavLink>
                        <div className={`dropdown dropdown-end ${isAuthenticated ? '' : 'hidden'}`}>
                            <div tabIndex="0" role="button">
                                <div tabIndex="0" role="button" className="btn btn-ghost btn-circle avatar">
                                    {client?.avatar ? (
                                        <img src={client.avatar} alt="Avatar" className="w-10 rounded-full"/>
                                    ) : (
                                        <User className={`text-white`}/>
                                    )}
                                </div>
                            </div>
                            <ul tabIndex="0"
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                                <li>
                                    <p className={"text-sm font-bold"}>
                                        {client.firstname} {client.lastname}
                                    </p>
                                </li>
                                <li>
                                    <NavLink to="/profile">Modifier son profil</NavLink>
                                </li>
                                <li>
                                    <button onClick={logout}>Se déconnecter</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </header>
            <nav className="bg-tertiary w-full h-12 flex items-center justify-center px-8">
                <ul className="flex space-x-8">
                    {navItems.map((item) => (
                        <li key={item.name} className="text-sm md:text-base hover:text-primary">
                            <NavLink to={item.path}
                                     className={({isActive}) => (isActive ? 'text-primary' : 'text-quaternary')}>
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <Outlet/>
        </>
    );
};

export default Layout;