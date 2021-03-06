import { AppBar, createStyles, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Theme, Toolbar, Typography, withStyles, WithStyles, Switch } from "@material-ui/core";
import { AccountTree, Book, Eco, ExitToApp, SupervisorAccount, ArrowBack, ClearAll, VerifiedUser, DoubleArrow, Search } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { matchRoutes, renderRoutes } from "react-router-config";
import { AuthenticationApi } from "../services/authentication-service";
import { t } from "../services/translation-service";
import { IPropsWithAppContext, withAppContext } from "./app-context";
import { BaseComponent } from "./base-component";
import { ShortcutsMenu } from "./shortcuts-menu";
import { UserModel } from "../services/generated/user-model";
import PWAPrompt from 'react-ios-pwa-prompt'
import HomePageConfig from "../pages/home/home-page-config";
import { ScorePageConfig } from "../pages/score/score-page-config";
import { SpeciesInfoPageConfig } from "../pages/species/species-info-page-config";
import LoginPageConfig from "../pages/login/login-page-config";
import { MapPageConfig } from "../pages/map/map-page-config";
import { ArboretumPageConfig } from "../pages/arboretum/arboretum-page-config";
import { DeterminationKeyPageConfig } from "../pages/determination-key/determination-key-page-config";
import { TitlePageConfig } from "../pages/score/title-page-config";
import { SpeciesPageConfig } from "../pages/species/species-page-config";
import { ObservationsPageConfig } from "../pages/observation/observations-page-config";
import { ObservationsApi } from "../services/observation";
import { TrophyPageConfig } from "../pages/score/trophy-page-config";
import { Confirm } from "./confirm";
import { UserRole } from "../services/generated/user-role";
import { UserEditionModel } from "../services/generated/user-edition-model";
import { CreateMissionComponentConfig } from "../pages/Missions/create-mission-config";
import { FoliaPage } from "../pages/folia/folia-page";

const styles = (theme: Theme) => createStyles({
    menu: {
        "& .MuiPaper-root": {
            backgroundColor: theme.palette.background,
            padding: "6px 12px"
        }
    },
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    }
});

interface LayoutProps extends IPropsWithAppContext, RouteComponentProps, WithStyles<typeof styles> {
}

class LayoutState {
    title = "";
    isUserAdmin = false;
    isUserConnected = false;
    user: UserModel;
    uem = new UserEditionModel();
    isExpert: boolean;
}

class LayoutComponent extends BaseComponent<LayoutProps, LayoutState>{
    constructor(props: LayoutProps) {
        super(props, "layout", new LayoutState());
    }

    async componentDidMount() {
        this.props.history.listen((data) => this.onRouteChanged(data as unknown as any));
        this.props.appContext.addContextUpdateListener(() => this.onContextChanged());
        this.onRouteChanged(this.props.location);
        const isUserAdmin = await AuthenticationApi.isUserAdmin();
        const user = await AuthenticationApi.getCurrentUser();
        this.setState({ isUserAdmin: isUserAdmin, user: user });
        this.isConnected();
        this.CheckRole();
    }

    async componentWillUnmount() {
        this.props.appContext.removeContextUpdateListener(() => this.onContextChanged());
    }

    async onRouteChanged(data: { pathname: string }) {
        const reactRoutes = this.props.appContext.routes.map(route => route.routes).reduce((a, b) => a.concat(b), [])
        const matched = matchRoutes(reactRoutes, data.pathname)[0];

        if (matched) {
            const config = this.props.appContext.routes.find(route => route.routes.some(r => r.path === matched.route.path));

            if (this.props.appContext.updateContext && this.state.title !== config.settings.title) {
                await this.props.appContext.updateContext("title", config.settings.title);
            }
        }
    }

    async onContextChanged() {
        this.isConnected();

        if (this.props.appContext.title && this.props.appContext.title.length > 0 && this.state.title !== this.props.appContext.title) {
            await this.setState({ title: this.props.appContext.title });
        }
    }

    async logOut() {
        await AuthenticationApi.logOut();
        this.props.appContext.updateContext("isConnected", false);
        this.props.appContext.updateContext("menuIsOpen", false);

        this.props.history.replace("/login");
        await this.setState({ isUserConnected: false })
    }

    async goTo(route: string) {
        this.props.history.push({
            pathname: route
        });

        await this.props.appContext.updateContext("menuIsOpen", false);
    }

    async isConnected() {
        const user = await AuthenticationApi.getCurrentUser();
        if (user) {
            await this.setState({ isUserConnected: true })
        }
        else {
            await this.setState({ isUserConnected: false })
        }
    }
    async DeleteAllObservations() {
        if (!await Confirm("Voulez vous effacer tous les relevés existant?")) {
            return;
        }
        await ObservationsApi.deleteAllObservations();
    }
    async CheckRole() {
        if (this.state.user.role == UserRole.expert) {
            await this.setState({ isExpert: true });
        }
        else {
            await this.setState({ isExpert: false });
        }
    }
    async BecomeExpert() {
        this.state.uem.name = this.state.user.name;
        this.state.uem.osmId = this.state.user.osmId;
        if (this.state.user.role == UserRole.expert) {
            if (!await Confirm("Voulez vous quitter le rôle expert?")) {
                return;
            }
            this.state.uem.role = UserRole.none;
        }
        else {
            if (!await Confirm("Voulez vous passer en mode expert?")) {
                return;
            }
            this.state.uem.role = UserRole.expert;
        }
        await AuthenticationApi.editUser(this.state.uem);
        const user = await AuthenticationApi.getCurrentUser();
        await this.setState({ user: user });
        await this.CheckRole();
    }
    hideBackButton() {
        const routes = this.props.appContext.routes.map(route => route.routes).reduce((a, b) => a.concat(b), []);
        const matched = matchRoutes(routes, this.props.location.pathname)[0];
        const routesConfig = [
            HomePageConfig,
            LoginPageConfig,
            ScorePageConfig,
            MapPageConfig,
            SpeciesPageConfig,
            ArboretumPageConfig,
            ObservationsPageConfig,
            DeterminationKeyPageConfig,
            CreateMissionComponentConfig
        ]
        if (matched) {
            return routesConfig.find(route => route.routes.some(r => r.path === matched.route.path)) != null;
        }
        return true;
    }

    render() {
        const { classes, appContext } = this.props;
        const routes = this.props.appContext.routes.map(route => route.routes).reduce((a, b) => a.concat(b), []);
        return (
            <div className={classes.root}>
                <PWAPrompt />
                <AppBar position="sticky">
                    <Toolbar>
                        {this.hideBackButton() &&
                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                                aria-label="menu"
                                disableFocusRipple
                                disableRipple
                                onClick={() => appContext.updateContext("menuIsOpen", !appContext.menuIsOpen)}
                            >
                                <Eco />
                            </IconButton>
                        }
                        {!this.hideBackButton() &&

                            <IconButton
                                edge="start"
                                className={classes.menuButton}
                                color="inherit"
                                aria-label="menu"
                                disableFocusRipple
                                disableRipple
                                onClick={() => { console.log(this.props.history); (this.props.history as any).goBack(); }}
                            >
                                <ArrowBack />
                            </IconButton>
                        }
                        <Typography variant="h6" className={classes.title}>
                            {this.state.title ? t.__(this.state.title) : "Albiziapp"}
                        </Typography>

                    </Toolbar>
                </AppBar>
                {this.state.isUserConnected &&
                    <Drawer
                        anchor={"left"}
                        open={this.props.appContext.menuIsOpen}
                        onClose={() => this.props.appContext.updateContext("menuIsOpen", false)}
                        className={classes.menu}>
                        <Toolbar>

                            <Eco className={clsx("mr-4")} />

                            <Typography variant="h6" className={classes.title}>
                                Albiziapp
                        </Typography>

                        </Toolbar>
                        <List >
                            {this.state.user &&
                                <ListItem style={{ marginTop: "-12%" }}>
                                    {this.state.user.name}
                                </ListItem>
                            }
                            <ListItem button onClick={() => this.goTo("/species")}>
                                <ListItemIcon>
                                    <Book />
                                </ListItemIcon>
                                <ListItemText primary={t.__("Flore")} />
                            </ListItem>
                            <ListItem button onClick={() => this.goTo("/folia")}>
                                <ListItemIcon>
                                    <Search />
                                </ListItemIcon>
                                <ListItemText primary={t.__("Folia")} />
                            </ListItem>
                            <ListItem button onClick={() => this.goTo("/determination-key")}>
                                <ListItemIcon>
                                    <AccountTree />
                                </ListItemIcon>
                                <ListItemText primary={t.__("Clé de détermination")} />
                            </ListItem>
                            {this.state.isUserAdmin &&
                                <>
                                    <ListItem button onClick={() => this.goTo("/users")}>
                                        <ListItemIcon>
                                            <SupervisorAccount />
                                        </ListItemIcon>
                                        <ListItemText primary={t.__("Gestion des utilisateurs")} />
                                    </ListItem>

                                    <ListItem button onClick={() => this.DeleteAllObservations()}>
                                        <ListItemIcon>
                                            <ClearAll />
                                        </ListItemIcon>
                                        <ListItemText primary={t.__("Supprimer tous les relevés")} />
                                    </ListItem>

                                    <ListItem button onClick={() => this.goTo("/create-mission")}>
                                        <ListItemIcon>
                                            <DoubleArrow />
                                        </ListItemIcon>
                                        <ListItemText primary={t.__("Création d'une mission")} />
                                    </ListItem>
                                </>
                            }
                            <ListItem button onClick={() => this.logOut()}>
                                <ListItemIcon>
                                    <ExitToApp />
                                </ListItemIcon>
                                <ListItemText primary={t.__("Me déconnecter")} />
                            </ListItem>
                        </List>
                    </Drawer>
                }

                {renderRoutes(routes)}
                {this.state.isUserConnected &&
                    <ShortcutsMenu />
                }
            </div>
        )
    }
}

export const Layout = withStyles(styles, { withTheme: true })(withRouter(withAppContext(LayoutComponent)));