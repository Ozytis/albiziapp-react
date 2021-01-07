import { PageConfig } from "../page-config";
import { EditObservationPage } from "./edit-observation-page";

export const EditObservationPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Modification d'un relevé"
    },
    routes: [{
        path: '/edit-observation/:observationid/:statementid?',
        component: EditObservationPage,
        exact: true
    }]
}