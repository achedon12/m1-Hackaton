const PageHeader = ({ title, description, backgroundImage }) => {
    return (
        <div className="relative w-full">
            <img src={backgroundImage} alt="Background" className="w-full h-50 object-cover opacity-75" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={"bg-white px-20 py-4 rounded-lg shadow-md text-center"}>
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-sm mt-2">{description}</p>
                </div>
            </div>
        </div>
    );
}

export default PageHeader;