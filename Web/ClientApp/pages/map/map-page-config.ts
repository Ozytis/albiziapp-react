import { PageConfig } from "../page-config";
import { MapPage } from "./map-page";

export const MapPageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Albiziapp"
    },
    routes: [{
        path: '/map',
        component: MapPage,
        exact: true
    }]
}