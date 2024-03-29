import { Container, createStyles, Theme, WithStyles, withStyles, Modal, IconButton } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { ActivitiesTab } from "./activities-tab";


const styles = (theme: Theme) => createStyles({
    root: {
        backgroundColor: theme.palette.primary.main,
        maxWidth: "100vw",
        margin: 0,
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        paddingBottom: "1vh",
        paddingTop: "2vh"
    },
    title: {
        marginBottom: "3vh",
        paddingTop: "3vh",
        color: theme.palette.common.white
    },
    tabs: {
        maxWidth: "1000vw",
        marginBottom: "1vh"
    },
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(7),
        color: theme.palette.primary.contrastText,
        zIndex: 9999
    }
});

interface HomePageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class HomePageState {
}

class HomePageComponent extends BaseComponent<HomePageProps, HomePageState>{
    constructor(props: HomePageProps) {
        super(props, "HomePage", new HomePageState());
    }

    async componentDidMount() {
    
    }
  

    render() {

        const { classes } = this.props;

        return (
            <Container fixed className={clsx(classes.root)}>
                <ActivitiesTab />   
            </Container>
        )
    }
}

export const HomePage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(HomePageComponent)));