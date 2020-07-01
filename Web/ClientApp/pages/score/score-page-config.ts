import { PageConfig } from "../page-config";
import { ScorePage } from "./score-page";

export const ScorePageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Mon score"
    },
    routes: [{
        path: '/score',
        component: ScorePage,
        exact: true
    }]
}