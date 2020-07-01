import { RouteConfig } from "react-router-config";

export interface PageConfig {
    settings: {
        authenticationRequired: boolean;
        title?: string;
    };

    routes: RouteConfig[];
}