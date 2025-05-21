import { useEffect, useState } from "react";
import config from "../../providers/apiConfig.js";
import {Loader} from "../../components/index.js";
import {Car, Fan, LoaderPinwheel, NotebookPen, Wrench} from "lucide-react";
import Botpress from "../../components/Botpress.jsx";
import { HelpCircle, X } from "lucide-react";

const Home = () => {
    const [popularOperations, setPopularOperations] = useState([]);
    const [operationsByCategory, setOperationsByCategory] = useState({});
    const [loading, setLoading] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const token = localStorage.getItem('token');

    const popularOperationsLogos = [
        <LoaderPinwheel />,
        <Car />,
        <Wrench />,
        <Fan />,
        <NotebookPen />
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
        const fetchOperations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${config.apiBaseUrl}/operations/list`, {
                    method: 'GET'
                });
                const data = await response.json();

                const groupedByCategory = data.operations.reduce((acc, operation) => {
                    const categoryName = operation.category.name;
                    if (!acc[categoryName]) {
                        acc[categoryName] = [];
                    }
                    acc[categoryName].push(operation);
                    return acc;
                }, {});

                setOperationsByCategory(groupedByCategory);
            } catch (error) {
                console.error('Error fetching operations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularOperations();
        fetchOperations();
    }, []);

    return (
        <div className="bg-cover bg-center w-full opacity-75" style={{ backgroundImage: "url('/garage2.jpg')" }}>
            <div className="flex flex-col items-center justify-center">
                <div className={"flex flex-col items-center justify-center bg-white p-8 md:w-3/4 m-10"}>
                    <div className={"flex flex-col items-center justify-center mb-4"}>
                        <h1 className={"text-xl font-bold"}>Nos opérations les plus recherchées</h1>
                        <hr className={'border-2 border-secondary w-20 mt-4'}/>
                    </div>
                    <div className={`grid grid-cols-3 gap-4 mt-4 ${loading ? '' : 'md:grid-cols-5'}`}>
                        {loading ? (
                            <Loader />
                        ) : (
                            popularOperations.map(operation => (
                                <div key={operation.id} className="cursor-pointer flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md">
                                    <div className={"h-10 flex items-center justify-center mb-2"}>
                                        {popularOperationsLogos[operation.id % popularOperationsLogos.length]}
                                    </div>
                                    <h2 className="text-base text-center h-12">{operation.libelle}</h2>
                                </div>
                            ))
                        )}
                    </div>
                </div>


                <div className={"flex flex-col items-center justify-center bg-white p-8 md:w-3/4 mb-20"}>
                    <div className={"flex flex-col items-center justify-center"}>
                        <h1 className={"text-xl font-bold"}>Nos prestations par catégorie</h1>
                        <hr className={'border-2 border-secondary w-20 mt-4'} />
                    </div>

                    <div className={`grid grid-cols-1 gap-4 mt-4 ${loading ? '' : 'md:grid-cols-3'}`}>
                        {loading ? (
                            <Loader />
                        ) : (
                            Object.entries(operationsByCategory).map(([categoryName, operations]) => (
                                <div key={categoryName} className="w-full">
                                    <h2 className="text-lg font-semibold p-4">{categoryName}</h2>
                                    <ul className="list">
                                        {operations.slice(0, 5).map((operation) => (
                                            <li key={operation.id} className="list-row p-2 link link-hover">{operation.libelle}</li>
                                        ))}
                                        {operations.length > 5 && (
                                            <li className="list-row p-2 link link-hover">
                                                <a href={`/operations/${categoryName}`} className="text-blue-500">Voir plus</a>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="fixed bottom-4 right-4 z-50">
                <Botpress/>
            </div>
        </div>
    );
};

export default Home;