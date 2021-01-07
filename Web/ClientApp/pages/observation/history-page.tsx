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
import { ObservationStatementModel } from "../../services/generated/observation-statement-model";
import { UserModel } from "../../services/generated/user-model";


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
    trait: {
        borderBottom: "1px solid black"
    }
});

interface HistoryPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class HistoryPageState {

    constructor() {
           }

    isProcessing = false;
    errors: string[];
    observation: ObservationModel;
    observationStatements: ObservationStatementModel[];
    filteredObservationStatements: ObservationStatementModel[];
    firstObservationStatement: ObservationStatementModel;
    myObservation: ObservationStatementModel;
    currentUser: UserModel;
    currentTab = "common";
}

class HistoryPageComponent extends BaseComponent<HistoryPageProps, HistoryPageState>{
    constructor(props: HistoryPageProps) {
        super(props, "HistoryPage", new HistoryPageState());
    }

    async componentDidMount() {
   

        const observation = await ObservationsApi.getObservation(this.props.match.params["observationid"]);
        const currentUser = await AuthenticationApi.getCurrentUser();
        await this.setState({ observation: observation, currentUser: currentUser, observationStatements: observation.observationStatements });
        this.filterObservationStatements();
        this.getUserObservation();
    }

    async filterObservationStatements() {
        const os = this.state.observationStatements;
        const fot = os.find(x => x.order = 1);
        this.setState({ firstObservationStatement: fot });
        const filteredOs = os.filter(x => x.order != 1);
        this.setState({ filteredObservationStatements: filteredOs });
    }

    setDateFormat(date: string) {
        console.log(date);
        if (date != null) {
            return new Date(date).toLocaleDateString()
        }
        return "";

    }
    async getUserObservation() {
        const os = this.state.observationStatements;
        const cu = this.state.currentUser;
        const observation = os.find(x => x.userId == cu.osmId);
        this.setState({ myObservation: observation });
    }

    async updateCurrentTab(val: string) {
        await this.setState({ currentTab: val });
        console.log(this.state.currentTab);
    }
    render() {

        const { classes } = this.props;
        const { observation, firstObservationStatement, currentUser, filteredObservationStatements } = this.state;  

        if (!observation && !firstObservationStatement) {
            return <>Chargement</>;
        }
        return (
            <>
                <Box>
                    <div style={{ marginTop: "2%" }}>
                        <table style={{ marginLeft: "auto", marginRight: "auto", border: "solid 1px black", width: "50%", height: "15px", borderRadius: "25px" }}>
                            <tr>
                                <td onClick={() => this.updateCurrentTab("common")}
                                    style={{ textAlign: "center", width: "50%", backgroundColor: this.state.currentTab == "common" ? "green" : "white", color: this.state.currentTab == "common" ? "white" : "black" }}>
                                    COMMUN
                                    </td>
                                <td onClick={() => this.updateCurrentTab("latin")}
                                    style={{ textAlign: "center", width: "50%", backgroundColor: this.state.currentTab == "latin" ? "green" : "white", color: this.state.currentTab == "latin" ? "white" : "black" }}>
                                    LATIN
                                    </td>
                            </tr>
                        </table>
                    </div>
                {
                    this.state.currentTab === "common" &&
                    <>
                            <table style={{ marginTop: "3%", textAlign: "center"  }}>
                            <thead>
                                <tr className={clsx(classes.bold)}>
                                        <th style={{ width: "50%", textAlign: "left"  }}>Proposition initiale</th>
                                        <th style={{ width: "25%" }}>Genre</th>
                                        <th style={{ width: "25%"}}>Espèce</th>
                                </tr>
                            </thead>
                            <tbody>
                                    
                                    {
                                        firstObservationStatement && currentUser &&
                                        <tr>
                                            <td>{firstObservationStatement.userName + ", " + this.setDateFormat(firstObservationStatement.date)}</td>
                                            <td>{firstObservationStatement.commonGenus}</td>
                                            <td>{firstObservationStatement.commonSpeciesName}</td>
                                        </tr>
                                    }
                                    <tr className={clsx(classes.trait)}>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                     <tr>
                                        <td className={clsx(classes.bold)} style={{textAlign:"left"}}>Proposition de la communauté</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    {
                                        filteredObservationStatements && filteredObservationStatements.map((os, index) => {
                                            return (<tr key={"CommonObservationStatement-" + index}>
                                                <td>{`${os.userName}, ${this.setDateFormat(os.date)}`}</td>
                                                <td>{os.commonGenus}</td>
                                                <td>{os.commonSpeciesName}</td>
                                            </tr>                                            
                                             )})
                                        }
                                    <tr className={clsx(classes.trait)}>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    {this.state.myObservation && 
                                        <tr>
                                            <td className={clsx(classes.bold)} style={{ textAlign: "left" }}>Ma proposition</td>
                                            <td>{this.state.myObservation.commonGenus}</td>
                                            <td>{this.state.myObservation.commonSpeciesName}</td>
                                        </tr>
                                    }
                            </tbody>
                        </table>
                    </>
                }
                {
                    this.state.currentTab === "latin" &&

                    <>
                            <table style={{ marginTop: "3%", textAlign: "center" }}>
                                <thead>
                                    <tr className={clsx(classes.bold)}>
                                        <th style={{ width: "50%", textAlign: "left" }}>Proposition initiale</th>
                                        <th style={{ width: "25%" }}>Genre</th>
                                        <th style={{ width: "25%" }}>Espèce</th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {
                                        firstObservationStatement && currentUser &&
                                        <tr>
                                            <td>{firstObservationStatement.userName + ", " + this.setDateFormat(firstObservationStatement.date)}</td>
                                            <td>{firstObservationStatement.genus}</td>
                                            <td>{firstObservationStatement.speciesName}</td>
                                        </tr>
                                    }
                                    <tr className={clsx(classes.trait)}>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td className={clsx(classes.bold)} style={{ textAlign: "left" }}>Proposition de la communauté</td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    {
                                        filteredObservationStatements && filteredObservationStatements.map((os, index) => {
                                            return (<tr key={"CommonObservationStatement-" + index}>
                                                <td>{`${os.userName}, ${this.setDateFormat(os.date)}`}</td>
                                                <td>{os.genus}</td>
                                                <td>{os.speciesName}</td>
                                            </tr>
                                            )
                                        })
                                    }
                                    <tr className={clsx(classes.trait)}>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    {this.state.myObservation &&
                                        <tr>
                                            <td className={clsx(classes.bold)} style={{ textAlign: "left" }}>Ma proposition</td>
                                            <td>{this.state.myObservation.genus}</td>
                                            <td>{this.state.myObservation.speciesName}</td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                    </>
                    }
                    </Box>
            </>
        )
    }
}

export const HistoryPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(HistoryPageComponent)));