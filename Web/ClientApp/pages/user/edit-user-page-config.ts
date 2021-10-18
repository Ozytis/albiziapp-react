import { PageConfig } from "../page-config";
import { EditUserPage } from "./edit-user-page";

export const EditUserPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Modification des données utilisateur"
    },
    routes: [{
        path: '/user',
        component: EditUserPage,
        exact: true
    }]
}