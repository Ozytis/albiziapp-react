import React, { Component, useState } from "react";
import { matchRoutes, RouteConfig, RouteConfigComponentProps } from "react-router-config";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { IPropsWithAppContext, withAppContext } from "./app-context";
import { BaseComponent } from "./base-component";
import { AuthenticationApi } from "../services/authentication-service";
import { PageConfig } from "../pages/page-config";
import { LoginPage } from "../pages/login/login-page";

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

        // console.log(JSON.stringify({ routes: state.routes, pathname: pathname }))

        console.log("matched 2", matchRoutes(reactRoutes, pathname));

        if (!matched) {

            console.log("no route match");

            state.accessGranted = true;
            return state;
        }

        console.log(matched);

        const appRoute = matched && props.appContext.routes.find(route => route.routes.some(r => r.path === matched.route.path));

        console.log("approute", appRoute);

        if (appRoute.settings.authenticationRequired === false) {
            console.log("no auth required");
            state.accessGranted = true;
            return state;
        }

        const user = AuthenticationApi.getCurrentUser();

        console.log("current user", user);

        if (!user) {

            console.log("access denied");

            state.accessGranted = false;

            return state;
        }

        state.accessGranted = true;
        return state;
    }

    redirectRoute() {

        console.log("redirecting");

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
        console.log("access granted", this.state.accessGranted, this.props.children);
        return this.state.accessGranted ? <>{this.props.children}</> : null;
    }
}

export const Authorization = withAppContext(withRouter(AuthorizationComponent));