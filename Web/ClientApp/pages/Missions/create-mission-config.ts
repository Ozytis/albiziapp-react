import { PageConfig } from "../page-config";
import { CreateMissionPage } from "./create-mission";

export const CreateMissionComponentConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Identifier l'arbre"
    },
    routes: [{
        path: '/create-mission',
        component: CreateMissionPage,
        exact: true
    }]
}