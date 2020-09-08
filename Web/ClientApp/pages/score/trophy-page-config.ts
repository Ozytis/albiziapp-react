import { PageConfig } from "../page-config";
import { TrophyPage } from "./trophy-page";
export const TrophyPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Trophées"
    },
    routes: [{
        path: '/trophies',
        component: TrophyPage,
        exact: true
    }]
}