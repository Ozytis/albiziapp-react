import { PageConfig } from "../page-config";
import { UserPage } from "./user-page";

export const UserPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Informations sur l'utilisateur"
    },
    routes: [{
        path: '/user/:userid',
        component: UserPage,
        exact: true
    }]
}