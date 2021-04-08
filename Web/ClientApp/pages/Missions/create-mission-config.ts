import { PageConfig } from "../page-config";
import { CreateMissionPage } from "./create-mission";

export const CreateMissionComponentConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Nouvelle mission"
    },
    routes: [{
        path: '/create-mission',
        component: CreateMissionPage,
        exact: true
    }]
}