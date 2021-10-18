import { PageConfig } from "../page-config";
import { EditUserAdminPage } from "./edit-user-page-admin";

export const EditUserPageAdminConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Modification d'un utilisateur"
    },
    routes: [{
        path: '/edit-user/:userid',
        component: EditUserAdminPage,
        exact: true
    }]
}