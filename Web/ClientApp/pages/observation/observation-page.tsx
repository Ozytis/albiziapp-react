import { Box, Button, createStyles, Grid, Icon, InputLabel, List, ListItem, ListItemIcon, ListItemText, Switch, Tab, Tabs, Theme, Typography, WithStyles, withStyles, Radio, Paper } from "@material-ui/core";
import { Check, Delete, Edit, NearMe, Cancel, Add } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Confirm } from "../../components/confirm";
import { ObservationModel } from "../../services/generated/observation-model";
import { SpeciesInfoModel } from "../../services/generated/species-info-model";
import { ObservationsApi } from "../../services/observation";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";
import { AuthenticationApi } from "../../services/authentication-service";
import { MapPosition } from "../../components/mapPosition";
import { forEach, first } from "lodash";
import { ObservationStatementModel } from "../../services/generated/observation-statement-model";
import { NewObservationPage } from "../map/new-observation-page";

const styles = (theme: Theme) => createStyles({
    root: {
        //backgroundColor: theme.palette.primary.main,
        maxWidth: "100vw",
        margin: 0,
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: "1vh 1vw 1vh 1vw",
        marginBottom : "15%"
    },
    tab: {
        //color: theme.palette.common.white,
        outline: "none",
        "&:focus": {
            outline: "none"
        }
    },
    instructions: {
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
    },
    buttonsDiv: {
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
        display: "flex",
        justifyContent: "center",
        "&>button": {
            marginRight: theme.spacing(1)
        }
    },
    label: {

    },
    switchGrid: {
        padding: `0 ${theme.spacing(2)}px`
    },
    flex: {
        display: "flex",    
        justifyContent:"space-between"
    },
    bold: {
        fontWeight: "bold"
    },
    alignRight: {
        marginLeft:"50%",
        right: "1px",
    },
    slider: {
        position: "relative",
        marginLeft: "auto",
        marginRight: "auto",
    },
    slide: {
        // position: "absolute",
        top: 0,
        //height: "100%",
        backgroundColor: "#fff",
        backgroundPosition: "center center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat"
    },
    slideNav: {
        justifyContent: "center",
        display: "flex",
        padding: theme.spacing(1),
        "& > span ": {
            marginRight: theme.spacing(1),
            fontSize: "1rem"
        },
        "& .linkActive": {
            color: theme.palette.secondary.main
        }
    },
    center: {
        marginLeft:"auto",
        marginRight:"auto"
    },
    tabConfiance: {
        width: "20%",
        border: "solid 1px black",
        textAlign : "center"
    },
    top: {
        marginTop:"4%"
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    trait: {
        borderBottom: "1px solid black",
    }
});

interface ObservationPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ObservationPageState {
    observation: ObservationModel;
    currentTab: "common" | "latin" = "common";
    isDeleting = false;
    isValidated: boolean = false;
    displayConfirmButton: boolean = true;
    currentUser: string;
    isConfirmating: boolean = true;
    currentPictureIndex = 0;
    confidentLevel: string;
    isLowConfident: boolean;
    isMediumConfident: boolean;
    isHighConfident: boolean;
    observationStatements: ObservationStatementModel[];
    firstObservationStatement: ObservationStatementModel;
    enableEditAndDeleteButton: boolean;
    newStatement: ObservationStatementModel;
    isAddingStatement: boolean;
}

class ObservationPageComponent extends BaseComponent<ObservationPageProps, ObservationPageState>{
    constructor(props: ObservationPageProps) {
        super(props, "ObservationPage", new ObservationPageState());
    }

    async componentDidMount() {
        const observation = await ObservationsApi.getObservation(this.props.match.params["observationid"]);
        const currentUser = await AuthenticationApi.getCurrentUser();
        await this.setState({ observation: observation, currentUser: currentUser.osmId, observationStatements: observation.observationStatements });   
        this.filterObservationStatements();
        this.isEditAndDeleteEnable();
    }

    async filterObservationStatements() {
            const os = this.state.observationStatements;
            const fot = os.find(x => x.order = 1);
            this.setState({ firstObservationStatement: fot }); 
            const filteredOs = os.filter(x => x.order != 1);
            this.setState({ observationStatements: filteredOs });
    }

    async remove() {

        if (this.state.isDeleting || ! await Confirm(t.__("Etes-vous sûr de vouloir supprimer ce relevé ?"))) {
            return;
        }

        await this.setState({ isDeleting: true });
        const result = await ObservationsApi.deleteObservation(this.state.observation);
        await this.setState({ isDeleting: false });

        if (result.success) {
            this.props.history.push({
                pathname: "/map"
            })
        }
    }

    async editObservation() {
        this.props.history.push({
            pathname: `/edit-observation/${this.state.observation.id}`
        });
    }

    async addStatement() {
        this.props.history.push({
            pathname: `/new-observation/${this.state.observation.id}`
        });
    }

    async goTo(path: string) {
        this.props.history.push({
            pathname: path
        });
    }
    async updateLocalStorage() {
        var now = new Date();
        localStorage.setItem("mapPosition", JSON.stringify({ Latitude: this.state.observation.latitude, Longitude: this.state.observation.longitude, Zoom: 18, Date: now } as MapPosition));
    }
    
    async showConfirmation() {
        if (this.state.isConfirmating) {

            await this.setState({ isConfirmating: false });
        }
    }

    async hideConfirmation() {

        if (!this.state.isConfirmating) {

            await this.setState({ isConfirmating: true });
        }
    }

    async updateConfident(level: string) {

        if (level == "low") {
            if (this.state.isLowConfident) {
                await this.setState({ isLowConfident:false })
            }
            else if (!this.state.isLowConfident) {
                await this.setState({ isLowConfident: true, isMediumConfident:false, isHighConfident:false })
            }
        }

        if (level == "medium") {
            if (this.state.isMediumConfident) {
                await this.setState({ isMediumConfident: false })
            }
            else if (!this.state.isMediumConfident) {
                await this.setState({ isMediumConfident: true, isLowConfident:false, isHighConfident:false })
            }
        }

        if (level == "high") {
            if (this.state.isHighConfident) {
                await this.setState({ isHighConfident: false })
            }
            else if (!this.state.isHighConfident) {
                await this.setState({ isHighConfident: true, isLowConfident: false, isMediumConfident:false })
            }
        }

    }
    endSwipe(e: React.TouchEvent<HTMLElement>): void {

        if (!this.swipeStartLocation || !this.state.observation || !this.state.observation.pictures || this.state.observation.pictures.length < 2) {
            return;
        }

        const touch = e.changedTouches[0];

        const distance = touch.clientX - this.swipeStartLocation.x;
        const absX = Math.abs(distance);

        if (absX > 50) {

            let index = this.state.currentPictureIndex;
            index += distance < 0 ? 1 : -1;

            if (index > 0) {
                index = index % this.state.observation.pictures.length;
            }
            else if (index < 0) {
                index = this.state.observation.pictures.length + index;
            }

            this.setState({ currentPictureIndex: index });
        }
    }
    startSwipe(e: React.TouchEvent<HTMLElement>): void {
        //e.preventDefault();
        this.swipeStartLocation = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    swipeStartLocation: { x: number; y: number } = null;

    async isEditAndDeleteEnable() {
        const o = this.state.observation;
        const os = this.state.observationStatements;
        const cu = this.state.currentUser;
        if (o.userId == cu && os.length == null || os.length == 0) {
            await this.setState({ enableEditAndDeleteButton: true})
        }
        else {
            await this.setState({ enableEditAndDeleteButton: false})
        }

    }


    render() {

        const { classes } = this.props;
        const { observation, enableEditAndDeleteButton, observationStatements, firstObservationStatement } = this.state;
        console.log(firstObservationStatement);
        if (!observation) {
            return <>Chargement</>;
        }
        return (
            <>
                <Box className={clsx(classes.root)}>
                    <Box>
                    <Tabs value={this.state.currentTab} onChange={(_, index) => this.setState({ currentTab: index })} aria-label="simple tabs example">
                        <Tab label={t.__("Commun")} className={clsx(classes.tab)} value="common" />
                        {
                            observation.pictures &&
                            <Tab label={t.__("Latin")} className={clsx(classes.tab)} value="latin" />
                            }
                        </Tabs>
                        <div className={clsx(classes.flex)}>
                            <span className={clsx(classes.bold)}>
                                Identification:(
                                <span style={{ fontWeight: "normal", textDecoration: "underline" }} onClick={() => this.goTo(`/history/${observation.id}`)}>15</span>
                                )
                            </span>

                            <span>
                                <span className={clsx(classes.bold)}>Fiabilité:</span>
                               15%
                            </span>
                        </div>
                        
                    {
                        this.state.currentTab === "common" &&
                            <> 
                                <table style={{ marginTop: "3%", textAlign:"center" }}>
                                    <thead>
                                        <tr className={clsx(classes.bold)}>
                                            <th style={{ width: "35%" }}></th>
                                            <th style={{ width: "25%" }}>Genre</th>
                                            <th style={{ width: "25%" }}>Espèce</th>
                                            <th style={{ width: "5%" }}></th>
                                        </tr>
                                    </thead>                                    
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        {
                                            firstObservationStatement &&
                                        <tr>
                                            <td className={clsx(classes.bold)}>Proposition initiale</td>
                                            <td>{firstObservationStatement.commonGenus}</td>
                                            <td>{firstObservationStatement.commonSpeciesName}</td>
                                            <td hidden={this.state.isConfirmating}><input type="radio" name="confirmation" value="1" /> </td>
                                            </tr>
                                        }
                                        <tr className={clsx(classes.trait)}>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        {
                                            observationStatements && observationStatements.map((os, index) => {
                                                if (index == 0) {
                                                    return (
                                                        <tr key={"CommonObservationStatement-"+ index }>
                                                            <td className={clsx(classes.bold)}>Proposition de la communauté</td>
                                                            <td>{os.commonGenus}</td>
                                                            <td>{os.commonSpeciesName}</td>
                                                            <td hidden={this.state.isConfirmating}><input type="radio" name="confirmation" value={index} /> </td>
                                                        </tr>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <tr key={"CommonObservationStatement-" + index}>
                                                            <td></td>
                                                            <td>{os.commonGenus}</td>
                                                            <td>{os.commonSpeciesName}</td>
                                                            <td hidden={this.state.isConfirmating}><input type="radio" name="confirmation" value={index} /> </td>
                                                        </tr>
                                                 )
                                                }}
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </>
                    }
                    {
                        this.state.currentTab === "latin" &&
                            
                            <>
                                <table style={{ marginTop: "3%", textAlign: "center" }}>
                                    <thead>
                                        <tr className={clsx(classes.bold)}>
                                            <th style={{ width: "35%" }}></th>
                                            <th style={{ width: "25%" }}>Genre</th>
                                            <th style={{ width: "25%" }}>Espèce</th>
                                            <th style={{ width: "5%" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        {
                                            firstObservationStatement &&
                                            <tr>
                                                <td className={clsx(classes.bold)}>Proposition initiale</td>
                                                <td>{firstObservationStatement.genus}</td>
                                                <td>{firstObservationStatement.speciesName}</td>
                                                <td hidden={this.state.isConfirmating}><input type="radio" name="confirmation" value="1" /> </td>
                                            </tr>
                                        }
                                        <tr className={clsx(classes.trait)}>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        {
                                            observationStatements && observationStatements.map((os, index) => {
                                                if (index == 0) {
                                                    return (
                                                        <tr key={"LatinObservationStatement-" + index}>
                                                            <td className={clsx(classes.bold)}>Proposition de la communauté</td>
                                                            <td>{os.genus}</td>
                                                            <td>{os.speciesName}</td>
                                                            <td hidden={this.state.isConfirmating}><input type="radio" name="confirmation" value={index} /> </td>
                                                        </tr>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <tr key= { "LatinObservationStatement-" + index }>
                                                            <td></td>
                                                            <td>{os.genus}</td>
                                                            <td>{os.speciesName}</td>
                                                            <td hidden={this.state.isConfirmating}><input type="radio" name="confirmation" value={index} /> </td>
                                                        </tr>
                                                    )
                                                }
                                            }
                                            )}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                                </>
                    }

                    </Box>

                    <Box className={clsx(classes.top)} hidden={this.state.isConfirmating}  >
                        <table>
                          <tbody>
                            <tr>
                                <td style={{ width: "20%" }}>Confiance</td>
                                <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isLowConfident ? "green" : "white" }} onClick={() => this.updateConfident("low")}>
                                    Faible
                                    </td>
                                <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isMediumConfident ? "green" : "white" }} onClick={() => this.updateConfident("medium")}>
                                    Moyen   
                                </td>
                                <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isHighConfident ? "green" : "white" }} onClick={() => this.updateConfident("high")} >
                                    Haute
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Box>

                    <Box className={clsx(classes.buttonsDiv)}>
                        <Box>                        
                             {   this.state.displayConfirmButton &&
                            <Button color="secondary" disabled={this.state.isValidated} variant="contained" startIcon={<Check />} onClick={() => this.showConfirmation()}>
                                {t.__("Confirmer")}
                            </Button>
                            }
                        </Box>
                        <Box hidden={this.state.isConfirmating} >
                            <Button color="default" variant="contained" startIcon={<Cancel />} onClick={() => { this.hideConfirmation() }}>
                                {t.__("Annuler")}
                            </Button>
                        </Box>
                   
                    </Box>

                    <Box className={clsx(classes.slider)} onTouchEnd={(e) => this.endSwipe(e)} onTouchStart={(e) => this.startSwipe(e)}>
                        {
                            observation.pictures.map((image, idx) => {
                                if (idx !== this.state.currentPictureIndex) {
                                    return null;
                                }
                                return (
                                    <div key={idx} className={clsx("slide", classes.slide)} style={{/* backgroundImage: `url("${image}")`*/ }}>
                                        <img src={`/pictures?path=${image}`} style={{ width: "40%", height: "auto", margin: "0 auto" }} />
                                    </div>
                                )
                            })
                        }
                        {
                            observation.pictures && observation.pictures.length > 1 &&
                                <div className={clsx(classes.slideNav)}>
                                    {
                                       observation.pictures.map((_, index) => {
                                           return (
                                                <Icon key={index} className={clsx("fas fa-circle", { linkActive: index === this.state.currentPictureIndex })} onClick={() => this.setState({ currentPictureIndex: index })} />
                                           )
                                       })
                            }
                            </div>
                        }
                    </Box>
                    <Box className={clsx(classes.buttonsDiv)}>
                        <Box>
                            <Button color="primary" variant="contained" startIcon={<Add />} onClick={() => this.addStatement()}>
                                {t.__("Ajout d'une propostion")}
                            </Button>
                        </Box>
                        <Box>
                            <Button color="primary" variant="contained" startIcon={<NearMe />} onClick={async () => { await this.updateLocalStorage(); this.goTo("/map") }}>
                                {t.__("Voir sur la map")}
                            </Button>
                        </Box>
                    </Box>

                        {
                            enableEditAndDeleteButton &&
                            <>
                            <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="primary" variant="contained" startIcon={<Edit />} onClick={() => this.editObservation()}>
                                     {t.__("Modifier")}
                                 </Button>
                                 <Button color="secondary" variant="contained" startIcon={<Delete />} onClick={() => this.remove()}>
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

export const ObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ObservationPageComponent)));