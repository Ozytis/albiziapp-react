import { PageConfig } from "../page-config";
import { ExplorationPointsPage } from "./exploration-points-page";
export const ExplorationPointsPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Points d'exploration"
    },
    routes: [{
        path: '/exploration-points',
        component: ExplorationPointsPage,
        exact: true
    }]
}