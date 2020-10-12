import { PageConfig } from "../page-config";
import { UsersPage } from "./users-page";

export const UsersPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Gestion des utilisateurs"
    },
    routes: [{
        path: '/users',
        component: UsersPage,
        exact: true
    }]
}