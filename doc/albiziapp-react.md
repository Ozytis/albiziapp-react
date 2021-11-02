# Fonctionnement du projet Albiziapp react

## Les technologies

Les technologies utilisées sont :
- .NET Core 3.1 
- Mongo DB
- TypeScript  

Framework :
- ASP.NET Core 3.1
- ReactJS

## Structure de la solution

Les différents projets de la solution :
- Api
  - Les classes de ce projet sont les données d'échanges entre le côté client et le côté serveur du projet.
- Business
  - Projet gérant la partie métier du projet, la logique, les calcules... 
- Common
  - Projet comportant des classes utilsent entre plusieurs projets
- DataMigrator
  - Projet permettant d'insérer en base de données les données existantes d'Albiziapp depuis les fichiers JSON
- Entities
  - Projet contenant les classes qui permettent de faire le lien avec la base de données
- Folia
  - Projet qui permet de faire le lien avec le script python DeepFolia
- Web
  - Projet central de la solution, c'est lui qui contient la partie React / HTML.


![structure](./structure%20projet.png)

## Fonctionnement du projet

Nous pouvons distinguer deux parties du projet, la partie cliente (Celle qui s'exécute sur le navigateur de l'utilisateur) et la partie serveur.
La partie cliente se trouve dans le projet Web, dans le dossier "wwwroot".

Les deux parties communiquent via des API Rest. Toutes ces Apis sont dans le dossier Controllers du projet Web.

## Points importants

### Authentification
Le projet utilise le système d'authentification d'OpenStreetMap.

### appsettings.json
Fichier de configuration, permettant de compléter les différentes informations de connexions, MongoDb,Emails, emplacements des fichiers...

### Startup.cs
Le fichier Startup.cs qui se trouve à la racine du projet Web, permet d'initialiser les différents composants utilisés par le projet en reprenant certaines informations du fichier appSettigns.json. [Class Startup (Microsoft)](https://docs.microsoft.com/fr-fr/aspnet/core/fundamentals/startup?view=aspnetcore-3.1)

Il permet la mise en place du système d'injection de dépendance utilisé par tout le projet. [Injection des dépendances (Microsoft)](https://docs.microsoft.com/fr-fr/aspnet/core/fundamentals/dependency-injection?view=aspnetcore-3.1)

### Leaflet et carte IGN
Le projet utilise pour la cartographie la librairie [LeafLet] (https://leafletjs.com/) avec les tuiles (Fond de carte et images sattelites) fournies par [Géoportail](https://geoservices.ign.fr/services-web)

### Signal R
Le projet utilise la librairie de Microsoft Signal R [Introduction à Signal R](https://docs.microsoft.com/fr-fr/aspnet/signalr/overview/getting-started/introduction-to-signalr)

Cette librairie permet la communication en temps réel de la partie client et de la partie serveur du projet. Elle est utilisée afin de notifier l'utilisateur lors d'un gain de points, d'une validation d'un relevé ainsi que pour la mise à jour de la carte en temps réel si un utilisateur ajoute un relevé à proximité.

### Hangfire
Hangfire est une librairie permettant de gérer l'exécution de certaines méthodes de façon complètement asynchrone. Elle est utilisée notamment pour l'envoi des mails.

