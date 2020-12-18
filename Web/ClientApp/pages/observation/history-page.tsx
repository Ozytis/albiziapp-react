import { Box, Button, createStyles, FormControl, Grid, InputLabel, MenuItem, Select, Switch, Theme, Typography, WithStyles, withStyles, TextField, Modal, IconButton, RadioGroup, Radio, FormControlLabel, Tab, Tabs } from "@material-ui/core";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { AuthenticationApi } from "../../services/authentication-service";
import { ObservationsApi } from "../../services/observation";
import { ObservationModel } from "../../services/generated/observation-model";
import clsx from "clsx";
import { t } from "../../services/translation-service";


const styles = (theme: Theme) => createStyles({
    tab: {
        //color: theme.palette.common.white,
        outline: "none",
        "&:focus": {
            outline: "none"
        }
    },
    bold: {
        fontWeight: "bold"
    },
});

interface HistoryPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class HistoryPageState {

    constructor() {
           }

    isProcessing = false;
    errors: string[];
    observation: ObservationModel;
    currentUser: string;
    currentTab: "common" | "latin" = "common";
}

class HistoryPageComponent extends BaseComponent<HistoryPageProps, HistoryPageState>{
    constructor(props: HistoryPageProps) {
        super(props, "HistoryPage", new HistoryPageState());
    }

    async componentDidMount() {
   

        const observation = await ObservationsApi.getObservation(this.props.match.params["observationid"]);
        const currentUser = await AuthenticationApi.getCurrentUser();
        console.log(observation.historyEditor);
        await this.setState({ observation: observation, currentUser: currentUser.osmId });
    }

    
    render() {

        const { classes } = this.props;
        const { observation } = this.state;  

        if (!observation) {
            return <>Chargement</>;
        }
        return (
            <>
                <Box>
                    <Tabs value={this.state.currentTab} onChange={(_, index) => this.setState({ currentTab: index })} aria-label="simple tabs example">
                        <Tab label={t.__("Commun")} className={clsx(classes.tab)} value="common" />
                         <Tab label={t.__("Latin")} className={clsx(classes.tab)} value="latin" />                        
                    </Tabs>
                {
                    this.state.currentTab === "common" &&
                    <>
                        <table style={{ marginTop: "3%" }}>
                            <thead>
                                <tr className={clsx(classes.bold)}>
                                    <th style={{ width: "35%" }}></th>
                                    <th style={{ width: "25%" }}>Genre</th>
                                    <th style={{ width: "25%" }}>Espèce</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td className={clsx(classes.bold)}>Proposition initiale</td>
                                    <td>{observation.commonGenus}</td>
                                    <td>{observation.commonSpeciesName}</td>
                                </tr>
                                <tr>
                                    <td className={clsx(classes.bold)}>Proposition de la communauté</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </>
                }
                {
                    this.state.currentTab === "latin" &&

                    <>
                        <table style={{ marginTop: "3%" }}>
                            <thead>
                                <tr className={clsx(classes.bold)}>
                                    <th style={{ width: "35%" }}></th>
                                    <th style={{ width: "25%" }}>Genre</th>
                                    <th style={{ width: "25%" }}>Espèce</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td className={clsx(classes.bold)}>Proposition initiale</td>
                                    <td>{observation.commonGenus}</td>
                                    <td>{observation.commonSpeciesName}</td>
                                </tr>
                                <tr>
                                    <td className={clsx(classes.bold)}>Proposition de la communauté</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </>
                    }
                    </Box>
            </>
        )
    }
}

export const HistoryPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(HistoryPageComponent)));