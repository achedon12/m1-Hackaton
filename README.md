# Projet Hackaton ESGI 2025

Ce projet a été réalisé dans le cadre de la Hackathon ESGI 2025. Il s'agit d'un projet de développement d'une
application de gestion de véhicules au sein de garages partenaires. L'application permet aux utilisateurs de gérer leurs
véhicules, de prendre des rendez-vous pour des réparations et d'accéder à des informations sur les garages partenaires.

## Fonctionnalités

- Gestion des véhicules : ajout, modification et suppression de véhicules.
- Prise de rendez-vous : possibilité de prendre des rendez-vous pour des réparations.
- Création de factures : génération de factures pour les réparations effectuées.
- Création de devis : possibilité de créer des devis pour les réparations à venir.
- Gestion des garages : trouver des garages partenaires et consulter leurs informations
  (adresse, horaires d'ouverture, etc.).
- Gestion des utilisateurs : création de comptes utilisateurs.
- Chatbot : un chatbot intégré pour répondre aux questions des utilisateurs et prendre des rendez-vous.

## Technologies utilisées

- Frontend : React, Tailwind CSS et DaisyUI
- Backend : Symfony et Docker
- Base de données : MySQL
- Serveur de mail : Mailhog

## Installation

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/achedon12/m1-Hackaton.git
    ```

2. Lancer le backend

    ```bash
    cd backend # Assurez-vous d'être dans le répertoire backend
    docker-compose up -d # Lancer les conteneurs Docker
    php bin/console doctrine:migrations:migrate # Appliquer les migrations
    php bin/console doctrine:fixtures:load # Charger les données de test
    php bin/console messenger:consume # Lancer le consommateur de messages en async
    ```
    - Accédez à l'interface de Mailhog à l'adresse suivante : [http://localhost:8025](http://localhost:8025)
    - Accédez à l'API à l'adresse suivante : [http://localhost:8000/api](http://localhost:8000/api)

3. Lancer le frontend

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4. Accédez à l'application dans votre navigateur à l'adresse suivante : [http://localhost:5173](http://localhost:5173)

## Utilisation

1. Créez un compte utilisateur.
2. Ajoutez vos véhicules.
3. Prenez rendez-vous pour des réparations.
4. Consultez les garages partenaires et leurs informations.
5. Générez des factures et des devis pour les réparations effectuées ou à venir.
6. Utilisez le chatbot intégré pour poser des questions et prendre des rendez-vous.
7. Consultez vos rendez-vous et vos factures dans votre espace utilisateur.
8. Modifiez ou supprimez vos véhicules si nécessaire.

## Contribuer

Si vous souhaitez contribuer à ce projet, n'hésitez pas à soumettre des demandes de tirage (pull requests) ou à signaler
des problèmes (issues) sur le dépôt GitHub.

## Auteurs

- [Léo Deroin](https://github.com/achedon12)
- [Mathys Farineau](https://github.com/)
- [Ethan Bourguigneau](https://github.com/A5hura666)
- [Alan Sapet](https://github.com/KazSoda)
- [Antoine Berthillot](https://github.com/poloine)

## License

Ce projet est sous licence MIT. Pour plus de détails, consultez le fichier [LICENSE](LICENSE).

## Remerciements

Nous remercions l'ESGI pour l'organisation de ce hackathon et les mentors pour leur soutien tout au long du projet.

## Contact

Pour toute question ou demande d'information, n'hésitez pas à nous contacter via GitHub ou par e-mail.

## Aide

Pour toute question ou demande d'aide concernant l'utilisation de l'application, n'hésitez pas à consulter la
documentation
ou à nous contacter via GitHub. Nous serons ravis de vous aider.
