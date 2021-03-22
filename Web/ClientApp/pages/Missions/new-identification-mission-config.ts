import { PageConfig } from "../page-config";
import { NewIdentificationMissionPage } from "./new-identification-mission";

export const NewIdentificationMissionPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Identifier l'arbre"
    },
    routes: [{
        path: '/new-identification-mission/:observationid',
        component: NewIdentificationMissionPage,
        exact: true
    }]
}