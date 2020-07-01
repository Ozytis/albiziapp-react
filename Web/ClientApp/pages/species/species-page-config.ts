import { PageConfig } from "../page-config";
import { SpeciesPage } from "./species-page";


export const SpeciesPageConfig: PageConfig = {
    settings: {
        authenticationRequired: false,
        title: "Flore Tela Botanica"
    },
    routes: [{
        path: "/species",
        component: SpeciesPage,
        exact: true
    }]
}