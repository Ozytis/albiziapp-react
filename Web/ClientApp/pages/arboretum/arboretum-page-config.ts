import { PageConfig } from "../page-config";
import { ArboretumPage } from "./arboretum-page";

export const ArboretumPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Mon arboretum"
    },
    routes: [{
        path: '/arboretum',
        component: ArboretumPage,
        exact: true
    }]
}