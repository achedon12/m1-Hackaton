import {User, Car, History} from "lucide-react";
import {useState} from "react";
import UserForm from "./profile/userForm/userForm.jsx";

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
                <button
                    className={`btn btn-ghost ${activeTab === "history" ? "bg-secondary" : "text-secondary"}`}
                    onClick={() => setActiveTab("history")}
                >
                    <History className={`w-6 h-6 ${activeTab === "history" ? "text-white" : "text-secondary"}`}/>
                </button>
            </div>


            <div className="p-6">
                {activeTab === "person" && (
                    <UserForm />
                )}
                {activeTab === "car" && (
                    <div>
                        <h1 className="text-xl">Ma voiture</h1>
                        <p>Contenu lié à la voiture...</p>
                    </div>
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