# Installation albiziapp-react

Exemple pour debian 10

## Installation des pré-requis

### Installation dotnet core ([https://docs.microsoft.com/fr-fr/dotnet/core/install/linux](https://docs.microsoft.com/fr-fr/dotnet/core/install/linux))
 

```bash
wget https://packages.microsoft.com/config/debian/10/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update; \
  sudo apt-get install -y apt-transport-https && \
  sudo apt-get update && \
  sudo apt-get install -y dotnet-sdk-3.1
```

### Installation docker et docker-compose
 [https://docs.docker.com/engine/install/debian/]( https://docs.docker.com/engine/install/debian/)

 [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)


## Installation du site

```bash
git clone https://github.com/Ozytis/albiziapp-react
cd ./albiziapp-react/
sudo docker-compose build
sudo docker volume create --name=web_data
sudo docker-compose up --no-start
sudo docker-compose start
```

### Insertion des données
```bash
cd ./DataMigrator/
dotnet run
```
Suivre les instructions du logiciel pour l'insertion des données.
Il faut insérer les 5 types de données différentes afin de pouvoir faire fonctionner correctement le site

### Accès au site
Par défaut le site est disponible sur le port 5100, en http.

Vous pouvez avoir accès au site depuis le navigateur http://{ip_du_serveur}:5100

### Modification du port du site
Il est possible de modifier le port du site en changeant le port 5100 dans le  fichier docker-compose.yml
```txt
  ports:
        - 5100:80
```


