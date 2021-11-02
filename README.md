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
### Installation de mongo db ([https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-debian/))

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.2 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt-get update
sudo apt-get install -y mongodb-org=4.2.15 mongodb-org-server=4.2.15 mongodb-org-shell=4.2.15 mongodb-org-mongos=4.2.15 mongodb-org-tools=4.2.15
sudo systemctl start mongod
```
### Installation de python 3.7 pour folia
```bash
sudo apt install python3.7
sudo apt install python3-pip
```
### Installation de nginx
```bash
sudo apt install nginx
```
## Installation du site

```bash
# Mettez vous dans le dossier de votre choix
wget -O albiziapp.tar.gz https://github.com/Ozytis/albiziapp-react/raw/master/dist/latest.linuxX64.tar.gz
tar -xvf albiziapp.tar.gz
chmod 755 Web
# Télécharger le dossier de folia et le mettre dans le dossier du site albiziapp
unzip DeepFolia.zip
cd ./DeepFolia
# Installation des dépendances de folia
pip3 install -r requirements.txt --no-cache-dir
```
### Configuration des paramètres

```bash
# Ouvrez le fichier de configuration
nano appsettings.json
```
Exemple de configuration
```txt
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "MongoDB": {
    "Database": "Albiziapp",
    "Host": "localhost",
    "Port": 27017
  },
  "FoliaPath": "/home/myUser/albiziapp/DeepFolia",
  "Reliability": {
    "MinimunScore": 150,
    "MinimunPercent": 50
  },
  "ContentDir": "/home/myUser/albiziapp/",
  "Data": {
    "Emails": {
      "DefaultSenderName": "Albiziapp",
      "DefaultSenderEmail": "ne-pas-repondre@albiziapp.com",
      "SmtpUser": "",
      "SmtpPassword": "",
      "SmtpHost": "",
      "SmtpPort": ""
    }
  }
}
```

### Configuration nginx
Configuration de nginx ([https://docs.microsoft.com/fr-fr/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-3.1](https://docs.microsoft.com/fr-fr/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-3.1))

Exemple de fichier de configuration nginx pour albiziapp
```txt
server {
    server_name   albiziapp.ozytis.fr ;
    location / {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection kee-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
    location /notifyhub {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

        location /positionhub {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
### Lancement du site
```bash
nohup ./Web > /dev/null 2>&1 &
```
### Insertion des données
```bash
wget https://github.com/Ozytis/albiziapp-react/raw/master/dist/DataMigrator.zip
unzip DataMigrator.zip -d ./DataMigrator
cd ./DataMigrator/
dotnet DataMigrator.dll
```
Suivez les instructions du logiciel pour l'insertion des données.
Il faut insérer les différents types de données différentes afin de pouvoir faire fonctionner correctement le site

## Pour aller plus loin 
### Passage d'un compte en admin
Pour passer un compte admin,
Connectez vous à la base de données mongo.
Dans la base utilisateur, cherchez l'utilisateur et modifier la valeur du champ "Role" à 2.

### HTTPS
Installation d'un certificat HTTPS ([https://certbot.eff.org/instructions] (https://certbot.eff.org/instructions))

