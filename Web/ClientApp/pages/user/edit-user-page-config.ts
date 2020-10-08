import { PageConfig } from "../page-config";
import { EditUserPage } from "./edit-user-page";

export const EditUserPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Modification d'un utilisateur"
    },
    routes: [{
        path: '/edit-user/:userid',
        component: EditUserPage,
        exact: true
    }]
}