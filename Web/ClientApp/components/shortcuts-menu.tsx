import React from "react";
import { BaseComponent } from "./base-component";
import { createStyles, withStyles, Theme, WithStyles, BottomNavigation, BottomNavigationAction, Icon } from "@material-ui/core";
import { withRouter, RouteComponentProps } from "react-router";
import { withAppContext, IPropsWithAppContext } from "./app-context";
import clsx from "clsx";
import { t } from "../services/translation-service";
import { Map, Home, Search, EditLocation } from "@material-ui/icons";

export type ShortcutType = "map" | "mission" | "score" | "statements" | "folia" | "arboretum";

// eslint-disable-next-line
const styles = (theme: Theme) => createStyles({
    root: {
        padding: "1rem",
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
      
        "& .MuiIcon-root": {
            width: "auto"
        }
    },
    menuItem: {
        border: 0,
        "&:focus, &:active": {
            border: 0,
            outline: 0
        }
    }
});

interface ShortcutsMenuProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ShortcutsMenuState {

}

export class ShortcutsMenuComponent extends BaseComponent<ShortcutsMenuProps, ShortcutsMenuState>{
    constructor(props: ShortcutsMenuProps) {
        super(props, "ShortcutsMenu", new ShortcutsMenuState());
    }

    async onMenuChanged(menu: ShortcutType) {



        switch (menu) {
            case "arboretum":
                this.props.history.replace({
                    pathname: "/arboretum"
                });
                break;
            case "map": {
                this.props.history.replace({
                    pathname: "/map"
                });
            }
                break;
            case "mission": {
                this.props.history.replace({
                    pathname: "/"
                });
            }
                break;
            case "score":
                this.props.history.replace({
                    pathname: "/score"
                });
                break;
            case "statements":
                this.props.history.replace({
                    pathname: "/observations"
                });
                break;
            default: break;
        }
    }

    getCurrentTabValue(): ShortcutType {
        let path = this.props.location.pathname;

        console.log("menu", path);

        path = path.indexOf("/") === 0 ? path.substr(1) : path;

        switch (path) {
            case "": return "mission";
            case "map": 
            case "new-observation": 
                return "map";
            case "observations": return "statements";
            case "score": return "score";
            case "arboretum": return "arboretum";
            case "folia": return "folia";
            default: return null;
        }
    }

    render() {

        const { classes } = this.props;
        const tabValue = this.getCurrentTabValue();

        return (
            <>
                <BottomNavigation className={clsx(classes.root)} value={tabValue} onChange={(e, val) => this.onMenuChanged(val)}>
                    <BottomNavigationAction className={clsx(classes.menuItem)} disableRipple disableTouchRipple value="map" label={t.__("Carte")} icon={<Map />} />
                    <BottomNavigationAction className={clsx(classes.menuItem)} disableRipple disableTouchRipple value="mission" label={t.__("Mission")} icon={<Home />} />
                    <BottomNavigationAction className={clsx(classes.menuItem)} disableRipple disableTouchRipple value="score" label={t.__("Score")} icon={<Icon className="fas fa-trophy fa-fw" />} />
                    <BottomNavigationAction className={clsx(classes.menuItem)} disableRipple disableTouchRipple value="arboretum" label={t.__("Arboretum")} icon={<Icon className="fas fa-leaf fa-fw" />} />
                    <BottomNavigationAction className={clsx(classes.menuItem)} disableRipple disableTouchRipple value="statements" label={t.__("Relevés")} icon={<EditLocation />} />
                </BottomNavigation>
            </>
        )
    }
}

export const ShortcutsMenu = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ShortcutsMenuComponent)))