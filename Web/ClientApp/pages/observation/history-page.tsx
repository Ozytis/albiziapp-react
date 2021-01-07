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
import { Edit, Delete } from "@material-ui/icons";
import { Confirm } from "../../components/confirm";


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
    },
    buttonsDiv: {
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
        display: "flex",
        justifyContent: "center",
        "&>button": {
            marginRight: theme.spacing(1)
        }
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
    enableEditAndDeleteButton: boolean;
    isDeleting = false;

}

class HistoryPageComponent extends BaseComponent<HistoryPageProps, HistoryPageState>{
    constructor(props: HistoryPageProps) {
        super(props, "HistoryPage", new HistoryPageState());
    }

    async componentDidMount() {
        console.log("cdm");

        const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
        const currentUser = await AuthenticationApi.getCurrentUser();
        await this.setState({ observation: observation, currentUser: currentUser, observationStatements: observation.observationStatements });
        this.filterObservationStatements();
        this.getUserObservation();
        this.isEditAndDeleteEnable();
    }


    componentWillReceiveProps() {
        console.log("cwrp");
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

    async isEditAndDeleteEnable() {
        const os = this.state.myObservation;
        console.log(os);
        if (os && !os.observationStatementConfirmations) {
            await this.setState({ enableEditAndDeleteButton: true })
        }
        else {
            await this.setState({ enableEditAndDeleteButton: false })
        }
    }

    async editObservation() {
        this.props.history.push({
            pathname: `/edit-observation/${this.state.observation.id}/${this.state.myObservation.id}`
        });
    }
    async remove() {

        if (this.state.isDeleting || ! await Confirm(t.__("Etes-vous sûr de vouloir supprimer ce relevé ?"))) {
            return;
        }

        await this.setState({ isDeleting: true });
        const result = await ObservationsApi.deleteStatement(this.state.observation.id, this.state.myObservation.id);
        await this.setState({ isDeleting: false });

        if (result.success) {
            const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
            await this.setState({ observation: observation, observationStatements: observation.observationStatements });
            this.filterObservationStatements();
            this.getUserObservation();
        }
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

                    {this.state.enableEditAndDeleteButton &&
                        <>
                        <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="primary" variant="contained" fullWidth startIcon={<Edit />} onClick={() => this.editObservation()}>
                                    {t.__("Modifier")}
                                </Button>
                                <Button color="secondary" variant="contained" fullWidth startIcon={<Delete />} onClick={() => this.remove()}>
                                    {t.__("Supprimer")}
                                </Button>
                            </Box>
                        </>
                    } 
                    </Box>
            </>
        )
    }
}

export const HistoryPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(HistoryPageComponent)));