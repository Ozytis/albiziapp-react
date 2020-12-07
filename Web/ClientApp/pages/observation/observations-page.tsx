import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { Theme, WithStyles, createStyles, withStyles, Box, List, ListItem, ListItemText, ListItemIcon } from "@material-ui/core";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { ObservationsApi } from "../../services/observation";
import { AuthenticationApi } from "../../services/authentication-service";
import { ChevronRight } from "@material-ui/icons";
import { ObservationModel } from "../../services/generated/observation-model";

// eslint-disable-next-line
const styles = (theme: Theme) => createStyles({
    root: {
        marginBottom: "15%",
    },
    card: {
        //color: theme.palette.common.white,
        cursor: "pointer",        
    }
});

interface ObservationsPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ObservationsPageState {
    observations: ObservationModel[];
}

class ObservationsPageComponent extends BaseComponent<ObservationsPageProps, ObservationsPageState>{
    constructor(props: ObservationsPageProps) {
        super(props, "ObservationsPage", new ObservationsPageState());
    }

    async componentDidMount() {
        ObservationsApi.registerObservationsListener(() => this.loadObservations());

        this.loadObservations();
    }

    async loadObservations() {

        const observations = await ObservationsApi.getUserObservations(AuthenticationApi.user.osmId);


        if (!this.unmounted) {
            await this.setState({ observations: observations });
        }
    }

    unmounted = false;

    async componentWillUnmount() {

        this.unmounted = true;

        ObservationsApi.unregisterObservationsListener(() => this.loadObservations());
    }

    async goTo(path: string) {
        this.props.history.push({
            pathname: path
        })
    }


    render() {

        const { classes } = this.props;

        return (
            <Box className={clsx(classes.root)}>
                <List>
                    {
                        this.state.observations && this.state.observations.map(observation => {
                            return (
                                <ListItem key={observation.id} onClick={() => this.goTo(`observation/${observation.id}`)} className={clsx(classes.card)}>
                                    <ListItemText primary={observation.speciesName} secondary={new Date(observation.date).toLocaleString()} />
                                    <ListItemIcon>
                                        <ChevronRight />
                                    </ListItemIcon>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Box>
        )
    }
}

export const ObservationsPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ObservationsPageComponent)));