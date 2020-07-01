import { PageConfig } from "../page-config";
import { HomePage } from "./home-page";

const HomePageConfig: PageConfig = {
    settings: {
        authenticationRequired: true,
        title: "Mes missions"
    },
    routes: [{
        path: '/',
        component: HomePage,
        exact: true
    }]


}

export default HomePageConfig;