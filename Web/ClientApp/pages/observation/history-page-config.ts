import { PageConfig } from "../page-config";
import { HistoryPage } from "./history-page";

export const HistoryPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Historique"
    },
    routes: [{
        path: '/history/:observationid',
        component: HistoryPage,
        exact: true
    }]
}