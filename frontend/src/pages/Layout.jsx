import { Outlet, NavLink } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useAuth } from "../providers/AuthProvider.jsx";
import { LocationProvider, LocationContext } from "../components/LocationContext.jsx";
import { useContext } from "react";
import config from "../providers/apiConfig.js";

const Header = ({ isAuthenticated, client, location, nearestGarage, logout }) => (
    <header className="navbar shadow-sm md:px-20 lg:px-60 bg-secondary">
        <div className="flex-1">
            <NavLink to="/" className="flex text-xl text-white hover">
                <img src="logo-white.png" alt="logo" className="h-8 mr-2 fill-white" />
                <h1 className="text-xl md:text-2xl text-white font-bold">RD-Vroum</h1>
            </NavLink>
        </div>
        <div className="flex-none">
            <div className="flex items-center gap-4">
                {location && (
                    <div className="flex items-center text-white">
                        <MapPin className="w-6 h-6 mr-1" />
                        <span>
                            {nearestGarage ? (
                                <>
                                    <p className="text-sm font-bold uppercase">
                                        {nearestGarage.zipcode} {nearestGarage.city}
                                    </p>
                                    <p className="text-xs">{nearestGarage.name}</p>
                                </>
                            ) : (
                                "Localisation en cours..."
                            )}
                        </span>
                    </div>
                )}
                {!isAuthenticated ? (
                    <NavLink to="/login" className="text-white">
                        Se connecter
                    </NavLink>
                ) : (
                    <UserMenu client={client} logout={logout} />
                )}
            </div>
        </div>
    </header>
);

const UserMenu = ({ client, logout }) => (
    <div className="dropdown dropdown-end">
        <div tabIndex="0" role="button" className="btn btn-ghost btn-circle avatar">
            {client && (
                <img
                    src={`${config.baseUrl}/uploads/avatars/${client.avatar}`}
                    alt="Avatar"
                    className="w-10 rounded-full"
                />
            )}
        </div>
        <ul
            tabIndex="0"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
        >
            <li>
                <NavLink to="/profile">Modifier son profil</NavLink>
            </li>
            <li>
                <NavLink to="/meeting">Mes rendez-vous</NavLink>
            </li>
            <li>
                <button onClick={logout}>Se déconnecter</button>
            </li>
        </ul>
    </div>
);

const NavBar = ({ navItems }) => (
    <nav className="bg-tertiary w-full h-12 flex items-center justify-center px-8">
        <ul className="flex space-x-8">
            {navItems.map((item) => (
                <li key={item.name} className="text-sm md:text-base hover:text-primary">
                    <NavLink
                        to={item.path}
                        className={({ isActive }) => (isActive ? "text-primary" : "text-quaternary")}
                    >
                        {item.name}
                    </NavLink>
                </li>
            ))}
        </ul>
    </nav>
);

const LayoutContent = () => {
    const { isAuthenticated, logout } = useAuth();
    const client = JSON.parse(localStorage.getItem("client"));
    const { location, nearestGarage } = useContext(LocationContext);

    const navItems = [
        { name: "Nos services", path: "/operations" },
        { name: "Nos garages", path: "/garages" },
    ];

    if (isAuthenticated) {
        navItems.unshift({ name: "Prendre un rendez-vous", path: "/takeMeeting" });
        navItems.unshift({ name: "Effectuer un devis", path: "/rdv" });
    }

    return (
        <>
            <Header
                isAuthenticated={isAuthenticated}
                client={client}
                location={location}
                nearestGarage={nearestGarage}
                logout={logout}
            />
            <NavBar navItems={navItems} />
            <Outlet />
        </>
    );
};

const Layout = () => (
    <LocationProvider>
        <LayoutContent />
    </LocationProvider>
);

export default Layout;