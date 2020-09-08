import { PageConfig } from "../page-config";
import { TitlePage } from "./title-page";
export const TitlePageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Titre"
    },
    routes: [{
        path: '/titles',
        component: TitlePage,
        exact: true
    }]
}