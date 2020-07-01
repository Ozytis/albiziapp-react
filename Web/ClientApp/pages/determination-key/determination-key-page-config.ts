import { PageConfig } from "../page-config";
import { DeterminationKeyPage } from "./determination-key-page";

export const DeterminationKeyPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Clé de détermination"
    },
    routes: [{
        path: '/determination-key',
        component: DeterminationKeyPage,
        exact: true
    }]
}