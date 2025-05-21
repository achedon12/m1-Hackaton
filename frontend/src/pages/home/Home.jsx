import {useEffect, useState} from "react";
import config from "../../providers/apiConfig.js";
import {Loader} from "../../components/index.js";
import {Car, Fan, LoaderPinwheel, NotebookPen, Wrench} from "lucide-react";
import {NavLink} from "react-router-dom";
import BotpressChat from "../../components/BotpressWebchat.jsx";

const Home = () => {
    const [popularOperations, setPopularOperations] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    const popularOperationsLogos = [
        <LoaderPinwheel/>,
        <Car/>,
        <Wrench/>,
        <Fan/>,
        <NotebookPen/>
    ]

    useEffect(() => {
        const fetchPopularOperations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${config.apiBaseUrl}/operations/popular`, {
                    method: 'GET'
                });
                const data = await response.json();
                setPopularOperations(data);
            } catch (error) {
                console.error('Error fetching popular operations:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPopularOperations();
    }, []);

    return (
        <div className="bg-cover bg-center w-full h-screen opacity-75" style={{backgroundImage: "url('/garage2.jpg')"}}>
            <div className="flex flex-col items-center justify-center">
                <div className={"flex flex-col items-center justify-center bg-white p-8 md:w-3/4 m-10"}>
                    <div className={"flex flex-col items-center justify-center mb-4"}>
                        <h1 className={"text-xl font-bold"}>Nos opérations les plus recherchées</h1>
                        <hr className={'border-2 border-secondary w-20 mt-4'}/>
                    </div>
                    <div className={`grid grid-cols-3 gap-4 mt-4 ${loading ? '' : 'md:grid-cols-5'}`}>
                        {loading ? (
                            <Loader/>
                        ) : (
                            popularOperations.map(operation => (
                                <NavLink to={`/rdv`} key={operation.id}
                                         className="cursor-pointer flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md">
                                    <div className={"h-10 flex items-center justify-center mb-2"}>
                                        {popularOperationsLogos[operation.id % popularOperationsLogos.length]}
                                    </div>
                                    <h2 className="text-base text-center h-12">{operation.libelle}</h2>
                                </NavLink>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <BotpressChat />
        </div>
    );
};

export default Home;