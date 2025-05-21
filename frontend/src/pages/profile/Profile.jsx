import {User, Car} from "lucide-react";
import {useState} from "react";
import UserForm from "./userForm/UserForm.jsx";
import CarForm from "./carForm/CarForm.jsx";
import {PageHeader} from "../../components";

const Profile = () => {
    const [activeTab, setActiveTab] = useState("person");

    return (
        <>
            <PageHeader
                title={"Profil"}
                description={"Gérez vos informations personnelles et vos véhicules"}
                backgroundImage={"/garage1.jpg"}
            />

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