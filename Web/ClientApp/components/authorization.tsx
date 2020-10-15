import React from "react";
import { matchRoutes } from "react-router-config";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { AuthenticationApi } from "../services/authentication-service";
import { IPropsWithAppContext, withAppContext } from "./app-context";
import { BaseComponent } from "./base-component";

interface AuthorizationProps extends RouteComponentProps, IPropsWithAppContext {

}

class AuthorizationState {
    accessGranted = false;
}

class AuthorizationComponent extends BaseComponent<AuthorizationProps, AuthorizationState> {
    constructor(props: AuthorizationProps) {
        super(props, "authorization", new AuthorizationState());
    }

    async componentDidMount() {

        if (!this.state.accessGranted) {
            console.log("access denied, redirecting");
            this.redirectRoute();
        }
    }

    componentDidUpdate() {
        if (!this.state.accessGranted) {
            console.log("access denied, redirecting");
            this.redirectRoute();
        }
    }

    static getDerivedStateFromProps(props: AuthorizationProps, state: AuthorizationState) {

        const { location } = props;
        const { pathname } = location;

        const reactRoutes = props.appContext.routes.map(route => route.routes).reduce((a, b) => a.concat(b), [])

        const matched = matchRoutes(reactRoutes, pathname)[0];


        if (!matched) {

            console.log("no route match");

            state.accessGranted = true;
            return state;
        }

 

        const appRoute = matched && props.appContext.routes.find(route => route.routes.some(r => r.path === matched.route.path));



        if (appRoute.settings.authenticationRequired === false) {
            console.log("no auth required");
            state.accessGranted = true;
            return state;
        }

        const user = AuthenticationApi.getCurrentUser();


        if (!user) {

            console.log("access denied");

            state.accessGranted = false;

            return state;
        }

        state.accessGranted = true;
        return state;
    }

    redirectRoute() {

        const { location, history } = this.props;

        const pathname = location.pathname;

        const state = location.state as { redirectUrl?: string };

        const redirectUrl = state && state.redirectUrl ? state.redirectUrl : '/';

        const user = AuthenticationApi.getCurrentUser();

        if (!user) {

            AuthenticationApi.logOut();

            console.log("redirecting to login");

            history.push({
                pathname: 'login',
            }, { redirectUrl: pathname });
        }
        else {
            history.push({
                pathname: redirectUrl
            });
        }
    }

    render() {       
        return this.state.accessGranted ? <>{this.props.children}</> : null;
    }
}

export const Authorization = withAppContext(withRouter(AuthorizationComponent));