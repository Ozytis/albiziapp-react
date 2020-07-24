import { ArboretumPageConfig } from "./pages/arboretum/arboretum-page-config";
import { DeterminationKeyPageConfig } from "./pages/determination-key/determination-key-page-config";
import HomePageConfig from "./pages/home/home-page-config";
import LoginPageConfig from "./pages/login/login-page-config";
import { MapPageConfig } from "./pages/map/map-page-config";
import { NewObservationPageConfig } from "./pages/map/new-observation-page-config";
import { ObservationPageConfig } from "./pages/observation/observation-page-config";
import { ObservationsPageConfig } from "./pages/observation/observations-page-config";
import { PageConfig } from "./pages/page-config";
import { ScorePageConfig } from "./pages/score/score-page-config";
import { SpeciesInfoPageConfig } from "./pages/species/species-info-page-config";
import { SpeciesPageConfig } from "./pages/species/species-page-config";

const routesConfig = [
    HomePageConfig,
    LoginPageConfig,
    ScorePageConfig,
    MapPageConfig,
    NewObservationPageConfig,
    ObservationPageConfig,
    SpeciesInfoPageConfig,
    SpeciesPageConfig,
    ArboretumPageConfig,
    ObservationsPageConfig,
    DeterminationKeyPageConfig
]

class RouteUtils {



    static generateRoutesFromConfigs(configs: PageConfig[]) {

        return configs;
    }
}

const routes = RouteUtils.generateRoutesFromConfigs(routesConfig);

export default routes;