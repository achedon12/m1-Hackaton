import {Trash} from "lucide-react";

const UserForm = () => {
    return (
        <div className={'flex flex-col items-center justify-center w-full p-6 bg-base-200'}>
            <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Identifiants</legend>

                <label className="label w-1/3">Mon adresse mail</label>
                <div className="flex items-center mb-4">
                    <input type="text" className="input flex-1" placeholder=""/>
                    <button className="btn btn-secondary ml-2">Modifier</button>
                </div>

                <label className="label w-1/3">Mon mot de passe</label>
                <div className="flex items-center">
                    <input type="password" className="input flex-1" placeholder="**********"/>
                    <button className="btn btn-secondary ml-2">Modifier</button>
                </div>
            </fieldset>

            <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Informations de facturation</legend>
                <p>Nom</p>
                <p>Adresse</p>
                <p>Téléphone</p>
                <button className="btn btn-secondary mt-4">Modifier</button>
            </fieldset>

            <fieldset className="fieldset bg-white border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Supprimer mon compte</legend>
                <p>Voulez-vous définitivement supprimer votre compte ?</p>
                <div className="flex items-center justify-center">
                    <button className="btn btn-error mt-4">
                        <Trash className="mr-2"/> Supprimer mon compte
                    </button>
                </div>
            </fieldset>
        </div>
    )
};

export default UserForm;