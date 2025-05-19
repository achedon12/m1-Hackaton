import {useState, useEffect} from "react";
import {Outlet, NavLink} from "react-router-dom";
import {ShoppingCart, User, MapPin} from "lucide-react";
import {useAuth} from "../providers/AuthProvider.jsx";

const Layout = () => {
    const {isAuthenticated} = useAuth();
    const [location, setLocation] = useState(null);
    const user = {
        name: "John Doe",
        avatar: "https://www.w3schools.com/howto/img_avatar.png",
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    setLocation({latitude, longitude});
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
            <nav className="navbar bg-base-100 shadow-sm md:px-20 lg:px-60 bg-primary">
                <div className={"flex-1"}>
                    <NavLink to="/" className="btn btn-ghost text-xl text-white">
                        <img src={"logo.png"} alt={"logo"} className={"w-8 h-8"}/>
                        RD-Vroum
                    </NavLink>
                </div>
                <div className="flex-none">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center text-white">
                            <MapPin className="w-6 h-6 mr-1"/>
                            {location ? (
                                <span>
                                    {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                                </span>
                            ) : (
                                <span>Localisation...</span>
                            )}
                        </div>
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
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="w-10 rounded-full"/>
                                    ) : (
                                        <User className={`text-white`}/>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <Outlet/>
        </>
    );
};

export default Layout;