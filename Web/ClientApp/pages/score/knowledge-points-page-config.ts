import { PageConfig } from "../page-config";
import { KnowledgePointsPage } from "./knowledge-points-page";

export const KnowledgePointsPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Points de connaissance"
    },
    routes: [{
        path: '/knowledge-points',
        component: KnowledgePointsPage,
        exact: true
    }]
}