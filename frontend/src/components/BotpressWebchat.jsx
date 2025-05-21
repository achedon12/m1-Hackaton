import { useEffect } from "react";

const BotpressChat = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.botpress.cloud/webchat/v2.5/inject.js";
        script.async = true;
        script.onload = () => {
            // Configurer le webchat après le chargement
            window.botpress.init({
                "botId": "552aee85-182b-4a41-a55f-3fe1e1eb51d1",
                "configuration": {
                    "composerPlaceholder": "Écrivez votre message ici",
                    "botName": "RD-Vroom IA",
                    "botAvatar": "https://files.bpcontent.cloud/2025/05/20/13/20250520135832-QND608RS.png",
                    "botDescription": "Posez-moi vos demandes !",
                    "website": {},
                    "email": {},
                    "phone": {},
                    "termsOfService": {},
                    "privacyPolicy": {},
                    "color": "#cbdeec",
                    "variant": "solid",
                    "themeMode": "dark",
                    "fontFamily": "ibm",
                    "radius": 4,
                    "storageLocation": "sessionStorage"
                },
                "clientId": "d7b487e3-8fff-4fda-9a7e-17a2b6e48bc1"
            });

            window.botpress.on("webchat:ready", () => {
                window.botpress.open();
            });
        };

        document.body.appendChild(script);
    }, []);

    return (
        <div
            id="webchat-container"
            style={{ position: "relative", width: "100%", height: "100%" }}
        />
    );
};

export default BotpressChat;
