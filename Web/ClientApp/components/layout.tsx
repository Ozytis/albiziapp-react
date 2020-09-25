import { AppBar, createStyles, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Theme, Toolbar, Typography, withStyles, WithStyles } from "@material-ui/core";
import { AccountTree, Book, Eco, ExitToApp, Search } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { matchRoutes, renderRoutes } from "react-router-config";
import { AuthenticationApi } from "../services/authentication-service";
import { t } from "../services/translation-service";
import { IPropsWithAppContext, withAppContext } from "./app-context";
import { BaseComponent } from "./base-component";
import { ShortcutsMenu } from "./shortcuts-menu";

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
}

class LayoutComponent extends BaseComponent<LayoutProps, LayoutState>{
    constructor(props: LayoutProps) {
        super(props, "layout", new LayoutState());
    }

    async componentDidMount() {
        this.props.history.listen((data) => this.onRouteChanged(data as unknown as any));
        this.props.appContext.addContextUpdateListener(() => this.onContextChanged());
        this.onRouteChanged(this.props.location);
    }

    async componentWillUnmount() {
        this.props.appContext.removeContextUpdateListener(() => this.onContextChanged());
    }

    async onRouteChanged(data: { pathname: string }) {

        console.log("route changed", data);

        const reactRoutes = this.props.appContext.routes.map(route => route.routes).reduce((a, b) => a.concat(b), [])
        const matched = matchRoutes(reactRoutes, data.pathname)[0];

        if (matched) {
            const config = this.props.appContext.routes.find(route => route.routes.some(r => r.path === matched.route.path));

            console.log("config", config, matched, this.props.appContext.title);

            if (this.props.appContext.updateContext && this.state.title !== config.settings.title) {
                console.log("updating title", config.settings.title);
                await this.props.appContext.updateContext("title", config.settings.title);
            }
        }
    }

    async onContextChanged() {

        console.log("onContextChanged");

        if (this.props.appContext.title && this.props.appContext.title.length > 0 && this.state.title !== this.props.appContext.title) {
            await this.setState({ title: this.props.appContext.title });
        }
    }

    async logOut() {
        await AuthenticationApi.logOut();
        this.props.appContext.updateContext("isConnected", false);
        this.props.appContext.updateContext("menuIsOpen", false);
        this.props.history.push("/login");
    }

    async goTo(route: string) {
        this.props.history.push({
            pathname: route
        });
        
        await this.props.appContext.updateContext("menuIsOpen", false);
    }

    render() {

        const { classes, appContext } = this.props;
        const routes = this.props.appContext.routes.map(route => route.routes).reduce((a, b) => a.concat(b), []);        

        return (
            <div className={classes.root}>
                <AppBar position="sticky">
                    <Toolbar>
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
                        <Typography variant="h6" className={classes.title}>
                            {this.state.title ? t.__(this.state.title) : "Albiziapp"}
                        </Typography>

                    </Toolbar>
                </AppBar>
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
                        <ListItem button onClick={() => this.logOut()}>
                            <ListItemIcon>
                                <ExitToApp />
                            </ListItemIcon>
                            <ListItemText primary={t.__("Me déconnecter")} />
                        </ListItem>
                    </List>

                </Drawer>
                {renderRoutes(routes)}
                <ShortcutsMenu />
            </div>
        )
    }
}

export const Layout = withStyles(styles, { withTheme: true })(withRouter(withAppContext(LayoutComponent)));

