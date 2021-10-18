import osmAuth from "osm-auth";
import { BaseService } from "./base-service";
import { UserModel } from "./generated/user-model";
import { UserLoginModel } from "./generated/user-login-model";
import { MissionUserModel } from "./generated/mission-user-model";
import { UserScoreModel } from "./generated/user-score-model";
import { UserEditionModel } from "./generated/user-edition-model";

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

        // const jsonUser = localStorage.getItem(AuthenticationService.userStorage);

        // if (!jsonUser) {
        //     return null;
        // }

        // return JSON.parse(jsonUser);

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
}

export const AuthenticationApi = new AuthenticationService();