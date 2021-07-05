import { PageConfig } from "../page-config";
import { FoliaPage } from "./folia-page";

export const FoliaPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Folia"
    },
    routes: [{
        path: '/folia',
        component: FoliaPage,
        exact: true
    }]
}
