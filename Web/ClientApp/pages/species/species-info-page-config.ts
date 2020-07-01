import { PageConfig } from "../page-config";
import { SpeciesInfoPage } from "./species-info-page";


export const SpeciesInfoPageConfig: PageConfig = {
    settings: {
        authenticationRequired: false,
        title: "Fiche espèce"
    },
    routes: [{
        path: "/species/:speciesid",
        component: SpeciesInfoPage,
        exact: true
    }]
}