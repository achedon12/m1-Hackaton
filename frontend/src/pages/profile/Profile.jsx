import {User, Car} from "lucide-react";
import {useState} from "react";
import UserForm from "./userForm/UserForm.jsx";
import CarForm from "./carForm/CarForm.jsx";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("person");

    return (
        <>
            <div className="relative w-full">
                <img src={"/garage1.jpg"} alt="Background" className="w-full h-50 object-cover opacity-75" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={"bg-white px-20 py-4 rounded-lg shadow-md text-center"}>
                        <h1 className="text-3xl font-bold">Profil</h1>
                        <p className="text-sm mt-2">Gérez vos informations personnelles et vos véhicules</p>
                    </div>
                </div>
            </div>

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


            <div className="p-6 md:px-60 bg-slate-100">
                <div className={'w-full mb-2 bg-tertiary'}>
                    <h1 className={"text-xl"}>
                        {activeTab === "person" && "Mes informations personnelles"}
                        {activeTab === "car" && "Mes véhicules"}
                    </h1>
                    <hr className={'border-2 border-secondary w-20 mt-4'}/>
                </div>
                {activeTab === "person" && (
                    <UserForm/>
                )}
                {activeTab === "car" && (
                    <CarForm/>
                )}
            </div>
        </>
    );
};

export default Profile;