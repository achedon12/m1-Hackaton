import {useEffect, useState} from "react";
import config from "../../providers/apiConfig.js";
import {Loader} from "../../components/index.js";
import {Car, Fan, LoaderPinwheel, NotebookPen, Wrench, BotMessageSquare} from "lucide-react";
import ChatBot from "../../components/ChatBot.jsx";
import {HelpCircle, X} from "lucide-react";
import {NavLink} from "react-router-dom";
import {useAuth} from "../../providers/AuthProvider.jsx";

const PopularOperationCard = ({operation, icon, isAuthenticated}) => (
    isAuthenticated ?
        (<NavLink
            to={`/rdv`}
            key={operation.id}
            className={`cursor-pointer flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md`}
        >
            <div className="h-10 flex items-center justify-center mb-2">{icon}</div>
            <h2 className="text-base text-center h-12">{operation.libelle}</h2>
        </NavLink>
        ) : (
            <div
                key={operation.id}
                className={`cursor-default flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md`}
            >
                <div className="h-10 flex items-center justify-center mb-2">{icon}</div>
                <h2 className="text-base text-center h-12">{operation.libelle}</h2>
            </div>
        )
);

const Home = () => {
    const [popularOperations, setPopularOperations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const {isAuthenticated} = useAuth();

    const token = localStorage.getItem("token");

    const popularOperationsLogos = [<LoaderPinwheel/>, <Car/>, <Wrench/>, <Fan/>, <NotebookPen/>];

    useEffect(() => {
        const fetchPopularOperations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${config.apiBaseUrl}/operations/popular`, {
                    method: "GET",
                });
                const data = await response.json();
                setPopularOperations(data);
            } catch (error) {
                console.error("Error fetching popular operations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPopularOperations();
    }, []);

    return (
        <div className="bg-cover bg-center w-full h-screen opacity-75" style={{backgroundImage: "url('/garage2.jpg')"}}>
            <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center bg-white p-8 md:w-3/4 m-10">
                    <div className="flex flex-col items-center justify-center mb-4">
                        <h1 className="text-xl font-bold">Nos opérations les plus recherchées</h1>
                        <hr className="border-2 border-secondary w-20 mt-4"/>
                    </div>
                    <div className={`grid grid-cols-3 gap-4 mt-4 ${loading ? "" : "md:grid-cols-5"}`}>
                        {loading ? (
                            <Loader/>
                        ) : (
                            popularOperations.map((operation) => (
                                <PopularOperationCard
                                    key={operation.id}
                                    operation={operation}
                                    icon={popularOperationsLogos[operation.id % popularOperationsLogos.length]}
                                    isAuthenticated={isAuthenticated}
                                />
                            ))
                        )}
                    </div>
                </div>
                <NavLink to={"/garages"}>
                    <button className="btn btn-secondary mt-2 px-20 py-6 text-xl">Découvrir nos garages</button>
                </NavLink>
            </div>

            {token && (
                <div className="fixed bottom-4 right-4 z-50">
                    {isChatOpen ? (
                        <div className="relative">
                            <div className="absolute bottom-18 right-4 shadow-2xl">
                                <ChatBot/>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
                                title="Fermer le chat"
                            >
                                <X size={32}/>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
                            title="Ouvrir l'assistant"
                        >
                            <BotMessageSquare size={32}/>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;