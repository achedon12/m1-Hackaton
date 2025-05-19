import {User, Car, History} from "lucide-react";
import {useState} from "react";
import UserForm from "./userForm/UserForm.jsx";
import CarForm from "./carForm/CarForm.jsx";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("person");

    return (
        <>

            <div className="flex justify-center p-2 mt-4">
                <button
                    className={`btn btn-ghost ${activeTab === "person" ? "bg-secondary" : "text-secondary"}`}
                    onClick={() => setActiveTab("person")}
                >
                    <User className={`w-6 h-6 ${activeTab === "person" ? "text-white" : "text-secondary"}`}/>
                </button>
                <button
                    className={`btn btn-ghost ${activeTab === "car" ? "bg-secondary" : "text-secondary"}`}
                    onClick={() => setActiveTab("car")}
                >
                    <Car className={`w-6 h-6 ${activeTab === "car" ? "text-white" : "text-secondary"}`}/>
                </button>
            </div>


            <div className="p-6 md:px-60">
                <div className={'w-full mb-6 bg-tertiary'}>
                    <h1 className={"text-xl"}>
                        {activeTab === "person" && "Mes informations personnelles"}
                        {activeTab === "car" && "Mes véhicules"}
                        {activeTab === "history" && "Historique"}
                    </h1>
                    <hr className={'border-2 border-secondary w-20 mt-4'}/>
                </div>
                {activeTab === "person" && (
                    <UserForm/>
                )}
                {activeTab === "car" && (
                    <CarForm/>
                )}
                {activeTab === "history" && (
                    <div>
                        <h1 className="text-xl">Historique</h1>
                        <p>Contenu lié à l'historique...</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;