import { PageConfig } from "../page-config";
import { ObservationsPage } from "./observations-page";

export const ObservationsPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Mes relevés"
    },
    routes: [{
        path: '/observations',
        component: ObservationsPage,
        exact: true
    }]
}