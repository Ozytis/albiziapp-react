import osmAuth from "osm-auth";
import { BaseService } from "./base-service";
import { UserModel } from "./generated/user-model";
import { UserLoginModel } from "./generated/user-login-model";
import { MissionUserModel } from "./generated/mission-user-model";
import { UserScoreModel } from "./generated/user-score-model";
import { UserEditionModel } from "./generated/user-edition-model";
import { OsmModel } from "./models/osm-model";
import { ObservationModel } from "./generated/observation-model";
import { StringHelper } from "../utils/string-helper";
import { json2xml } from "xml-js";
import { ObservationsApi } from "./observation";
import { OSMStatus } from "./models/osmStatus-model";

class AuthenticationService extends BaseService {

    static osmUserStorage = "osm-user";
    static userStorage = "user";

    auth: OSMAuth.OSMAuthInstance;

    constructor() {
        super();

        this.auth = new osmAuth({
            /* eslint-disable */ oauth_secret: 'ycJOK6xrlW0tPXb280k1VLkH4zGlsaGyTPm4vGvr',
            /* eslint-disable */ oauth_consumer_key: '1zPARMhKbBJfy6lZa9Jt3SvXOM4D3bxr1s3pMly0',
            auto: true,
            singlepage: false,
        });


        //Dev        
        //this.auth = new osmAuth({
        //    /* eslint-disable */ oauth_secret: 'j9198iwCQlirX8zlEKyJAM2ShS6YFsMWdGiIfb1m',
        //    /* eslint-disable */ oauth_consumer_key: '8eiDGsGe5Ubi7dRlwrw3CrbpFggpyMXWrCBYTpXS',
        //    auto: true,
        //    singlepage: false,
        //    url:"https://master.apis.dev.openstreetmap.org"
        //});
    }

    async login() {

        try {
            const osmUser = await this.getOsmCurrentUser();
            this.osmUser = osmUser;
            localStorage.setItem(AuthenticationService.osmUserStorage, JSON.stringify(osmUser));
            return this.refreshUser();
        }
        catch (error) {
            console.error("Erreur de connexion", error);
        }

    }

    async logOut() {
        this.user = null;
        this.osmUser = null;
        localStorage.clear();
    }

    user: UserModel;
    osmUser: { name: string; id: string };

    getCurrentUser() {
        return this.user;       
    }

    async refreshUser() {

        const jsonOsmUser = localStorage.getItem(AuthenticationService.osmUserStorage);

        const osmUser = this.osmUser || JSON.parse(jsonOsmUser) as { name: string; id: string };

        if (!osmUser) {
            return null;
        }

        const result = await this.post<UserModel>(`users/login`, {
            osmId: osmUser.id,
            userName: osmUser.name
        } as UserLoginModel);

        if (!result.success) {
            return null;
        }

        this.osmUser = osmUser;
        this.user = result.data;

        return result.data;
    }

    async getUserMission() {
        return await this.get<MissionUserModel>("users/missions");
    }

    async getUserScore() {
        return await this.get<UserScoreModel>("users/score");
    }


    getOsmCurrentUser() {

        return new Promise<{ name: string; id: string }>((onSuccess, onError) => {

            this.auth.xhr({
                method: 'GET',
                path: '/api/0.6/user/details'
            }, (error, result) => {

                const user = result.getElementsByTagName('user')[0]
              
                let userObject = {
                    name: user.getAttribute('display_name'),
                    id: user.getAttribute('id')
                }

                onSuccess(userObject);
            });
        });
    }

    async isUserAdmin() {

        const isAdmin = await this.get<boolean>(`users/userAdmin`);

        return isAdmin;

    }
    async getAllUsers() {
        return await this.get<UserModel[]>(`users/allUsers`);
    }
    async searchUsers(search: string) {
        return await this.get<UserModel[]>(`users/searchUsers?search=${search}`);
    }
    async getUser(userId: string) {
        return await this.get<UserModel>(`users/${userId}`)
    }
    async editUserAdmin(user: UserEditionModel) {
        const result = await this.put<UserEditionModel>(`users/editUserAdmin`, user);
        await this.refreshUser();
        return result;
    }

    async editUser(user: UserEditionModel) {
        const result = await this.put<UserEditionModel>(`users/editUser`, user);
        await this.refreshUser();
        return result;
    }

    async sendObservationToOsm(observation: ObservationModel) {
        if (StringHelper.isNullOrEmpty(observation.statementValidatedId)) {
            return;
        }
        var initModel = new OsmModel();
        initModel.elements = [];
        initModel.elements.push({ type: "element", name: "osm", elements: [] });
        initModel.elements[0].elements.push({ type: "element", name: "changeset", attributes: { "version": "0.6", "generator": "Albiziapp" }, elements: [] });
        initModel.elements[0].elements[0].elements.push({ type: "element", name: "tag", attributes: { "k": "comment", "v": "Ajout arbre" } });
        initModel.elements[0].elements[0].elements.push({ type: "element", name: "tag", attributes: { "k": "created_by", "v": "Albiziapp" } });
        initModel.elements[0].elements[0].elements.push({ type: "element", name: "tag", attributes: { "k": "host", "v": `${window.location.origin}` } });
        initModel.elements[0].elements[0].elements.push({ type: "element", name: "tag", attributes: { "k": "locale", "v": "fr" } });
        initModel.elements[0].elements[0].elements.push({ type: "element", name: "tag", attributes: { "k": "imagery_used", "v": "BDOrtho IGN" } });
        initModel.elements[0].elements[0].elements.push({ type: "element", name: "tag", attributes: { "k": "changesets_count", "v": "19" } });

        this.auth.xhr({
            method: 'PUT', path: '/api/0.6/changeset/create', 
            options: { header: { "Content-Type": "text/xml" } },
            content: json2xml(JSON.stringify(initModel))
        },
             (err, details) =>{
                let urlUpload = '/api/0.6/changeset/' + details + '/upload'
                 let urlClose = '/api/0.6/changeset/' + details + '/close'
                 var uploadPost = this.getUploadPayload(details, observation);

                 this.auth.xhr({
                     method: 'POST', path: urlUpload,
                     options: { header: { "Content-Type": "text/xml" } },
                     content: json2xml(JSON.stringify(uploadPost))
                 }, (err, details) => {
                     console.log(details)
                     this.auth.xhr({
                         method: 'PUT', path: urlClose,
                         options: { header: { "Content-Type": "text/xml" } }
                     }, function () {                       
                         ObservationsApi.setObservationOSMStatus(observation.id, OSMStatus.SEND)
                     })

                 });
            });
    }

    private getUploadPayload(changeset: string, observation: ObservationModel) {
        var payload = new OsmModel();
        if (StringHelper.isNullOrEmpty(observation.statementValidatedId)) {
            return;
        }
        var validatedStatement = observation.observationStatements.find((o) => { return o.id == observation.statementValidatedId });

        payload.elements = [];
        payload.elements.push({ type: "element", name: "osmChange", attributes: { "version": "0.6", "generator": "Albiziapp" }, elements: [] });

        payload.elements[0].elements.push({ type: "element", name: "create", elements: [] });
        payload.elements[0].elements.push({ type: "element", name: "modify" });
        payload.elements[0].elements.push({ type: "element", name: "delete", attributes: { "if-unused": "true" } });

        payload.elements[0].elements[0].elements.push({ type: "element", name: "node", attributes: { "id": "-1", "lon": `${observation.longitude}`, "lat": `${observation.latitude}`, "version": "0", "changeset": `${changeset}` }, elements: [] });

        var obsevationDetails = payload.elements[0].elements[0].elements[0].elements;
        obsevationDetails.push({ type: "element", name: "tag", attributes: { "k": "natural", "v": "tree" } });
       
        if (!StringHelper.isNullOrEmpty(validatedStatement.speciesName)) {
            obsevationDetails.push({ type: "element", name: "tag", attributes: { "k": "species", "v": `${validatedStatement.speciesName}` } });
        }
        if (!StringHelper.isNullOrEmpty(validatedStatement.genus)) {
            obsevationDetails.push({ type: "element", name: "tag", attributes: { "k": "genus", "v": `${validatedStatement.genus}` } });
        }

        if (!StringHelper.isNullOrEmpty(validatedStatement.commonSpeciesName)) {
            obsevationDetails.push({ type: "element", name: "tag", attributes: { "k": "name:fr", "v": `${validatedStatement.commonSpeciesName}` } });
        }
        if (observation.pictures != null && observation.pictures.length >0) {
            obsevationDetails.push({ type: "element", name: "tag", attributes: { "k": "image", "v": `${window.location.origin}/${observation.pictures[0]}` } });
        }
        

        return payload;
    }
}

export const AuthenticationApi = new AuthenticationService();