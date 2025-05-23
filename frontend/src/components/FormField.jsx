const FormField = ({ label, name, type = "text", value, onChange, error, placeholder }) => (
    <fieldset className="fieldset bg-slate-100 border-base-300 rounded-box w-full border p-4 mt-4">
        <label className="label w-1/3">{label}</label>
        <input
            type={type}
            name={name}
            className={`input input-bordered w-full ${error ? "input-error" : ""}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        {error && <p className="text-red-500">{error}</p>}
    </fieldset>
);

export default FormField;