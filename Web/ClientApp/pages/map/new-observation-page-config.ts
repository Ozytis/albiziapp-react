import { PageConfig } from "../page-config";
import { NewObservationPage } from "./new-observation-page";

export const NewObservationPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Nouveau relevé"
    },
    routes: [{
        path: '/new-observation/:observationid?',
        component: NewObservationPage,
        exact: true
    }]
}