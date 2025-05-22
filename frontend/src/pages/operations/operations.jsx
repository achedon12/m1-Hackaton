import {useEffect, useState} from "react";
import Loader from "../../components/Loader.jsx";
import config from "../../providers/apiConfig.js";
import {PageHeader} from "../../components";

const Operations = () => {
    const [operationsByCategory, setOperationsByCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        const fetchOperations = async () => {
            try {
                const response = await fetch(`${config.apiBaseUrl}/operations/list`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
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

        fetchOperations();
    }, []);

    const toggleCategory = (categoryName) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [categoryName]: !prev[categoryName],
        }));
    };

    return (
        <div className="w-full">
            <PageHeader
                title={"Nos services"}
                description={"Découvrez nos opérations et services disponibles"}
                backgroundImage={"/garage1.jpg"}
            />
            {loading ? (
                <Loader/>
            ) : (
                <div className={"flex flex-col items-center justify-center overflow-auto h-full"}>
                    <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 bg-white p-8 w-5/6 md:w-3/4 lg:w-2/3 m-6`}>
                        {Object.entries(operationsByCategory).map(([categoryName, operations]) => (
                            <div key={categoryName} className="w-full">
                                <h2 className="text-lg font-semibold p-4">{categoryName}</h2>
                                <ul className="list">
                                    {(expandedCategories[categoryName] ? operations : operations.slice(0, 5)).map((operation) => (
                                        <li key={operation.id}
                                            className="list-row p-2">{operation.libelle}</li>
                                    ))}
                                    {operations.length > 5 && (
                                        <li className="list-row p-2 link link-hover">
                                            <button
                                                onClick={() => toggleCategory(categoryName)}
                                                className="text-blue-500"
                                            >
                                                {expandedCategories[categoryName] ? "Voir moins" : "Voir plus"}
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Operations;