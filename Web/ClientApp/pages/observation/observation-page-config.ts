import { PageConfig } from "../page-config";
import { ObservationPage } from "./observation-page";

export const ObservationPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Relevé"
    },
    routes: [{
        path: '/observation/:observationid',
        component: ObservationPage,
        exact: true
    }]
}