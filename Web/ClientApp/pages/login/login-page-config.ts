import { PageConfig } from "../page-config";
import { LoginPage } from "./login-page";

const LoginPageConfig: PageConfig = {
    settings: {
        authenticationRequired: false
    },
    routes: [{
        path: '/login',
        component: LoginPage,
        exact: true
    }]

}

export default LoginPageConfig;