import { Box, Button, createStyles, Grid, Icon, InputLabel, List, ListItem, ListItemIcon, ListItemText, Switch, Tab, Tabs, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { Check, Delete, Edit, NearMe } from "@material-ui/icons";
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
import { forEach } from "lodash";

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
    }
});

interface ObservationPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ObservationPageState {
    observation: ObservationModel;
    currentTab: "infos" | "photo" = "infos";
    isDeleting = false;
    specyInfo: SpeciesInfoModel;
    isValidated: boolean = false;
    displayConfirmButton: boolean = true;
    currentUser: string;
    enableDeleteButton: boolean;
}

class ObservationPageComponent extends BaseComponent<ObservationPageProps, ObservationPageState>{
    constructor(props: ObservationPageProps) {
        super(props, "ObservationPage", new ObservationPageState());
    }

    async componentDidMount() {
        const observation = await ObservationsApi.getObservation(this.props.match.params["observationid"]);
        const currentUser = await AuthenticationApi.getCurrentUser();
        console.log(observation);
        await this.setState({ observation: observation, currentUser:currentUser.osmId });
        await this.isValidated();
        await this.enableConfirmButton();
        await this.isDeleteButtonEnable();
        if (observation.telaBotanicaTaxon) {
            const info = await SpeciesApi.getSpeciesInfo(observation.telaBotanicaTaxon);
            await this.setState({ specyInfo: info[0] });
        }
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

    async isValidated() {
        if (this.state.observation != null && this.state.observation.validations != null) {
            var isValidated = this.state.observation.validations.findIndex(x => x == AuthenticationApi.user.osmId);
            console.log((isValidated != -1))
            await this.setState({ isValidated: (isValidated != -1) });
        } else {
            await this.setState({ isValidated: false });
        }
    }

    async enableConfirmButton() {
        if (this.state.observation.historyEditor != null) {
            var displayConfirmButton = this.state.observation.historyEditor.findIndex(x => x == AuthenticationApi.user.osmId);
            await this.setState({ displayConfirmButton: (displayConfirmButton == -1 || this.state.observation.userId != AuthenticationApi.user.osmId ) });
        } else {
            await this.setState({ displayConfirmButton: this.state.observation.userId != AuthenticationApi.user.osmId });
        }
    }




    async validateObservation() {
        await this.setState({ isDeleting: true });
        const result = await ObservationsApi.ValidateObservation(this.state.observation);
        await this.setState({ isDeleting: false, isValidated: true });
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


    getConfidentLabel(confident: number) {
        switch (confident) {
            case 0: return t.__("Peu confiant");
            case 1: return t.__("Moyennement confiant");
            case 2: return t.__("Confiant");
            default: return t.__("Non renseigné");
        }
    }

   
    async isDeleteButtonEnable() {

        const history = this.state.observation.historyEditor;
        const currentUser = this.state.currentUser; 

        if (history == undefined) {
            await this.setState({ enableDeleteButton: true });
            return;
        }
        const historyFiltered = history.filter(h => h == currentUser);


        if (historyFiltered.length == history.length) {
            console.log("test 1");
            if (currentUser == this.state.observation.userId) {
                console.log("test 2");
                await this.setState({ enableDeleteButton: true });
            }
            else {
                await this.setState({ enableDeleteButton: false });
            }
        }
        else {
            await this.setState({ enableDeleteButton: false });
        }
    }

    render() {

        const { classes } = this.props;
        const { observation, enableDeleteButton } = this.state;
        if (!observation) {
            return <>Chargement</>;
        }
        return (
            <>
                <Box className={clsx(classes.root)}>
                    <Tabs value={this.state.currentTab} onChange={(_, index) => this.setState({ currentTab: index })} aria-label="simple tabs example">
                        <Tab label={t.__("Informations")} className={clsx(classes.tab)} value="infos" />
                        {
                            observation.pictures &&
                            <Tab label={t.__("Photo")} className={clsx(classes.tab)} value="photo" />
                        }

                    </Tabs>

                    {
                        this.state.currentTab === "infos" &&
                        <>
                            <List>
                                <ListItem>
                                    <ListItemText primary={t.__("Auteur du relevé")} secondary={observation.authorName} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={t.__("Genre")} secondary={observation.genus || t.__("Non renseignée")} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={t.__("Genre vernaculaire")} secondary={observation.commonGenus || t.__("Non renseigné")} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={t.__("Espèce")} secondary={observation.speciesName || t.__("Non renseignée")} />
                                    {/*
                                        observation.telaBotanicaTaxon &&
                                        <ListItemIcon
                                            title={t.__("Espèce")}
                                            className={clsx(classes.tab)}
                                            onClick={() => this.goTo(`/specy/${observation.telaBotanicaTaxon}`)}
                                        >
                                            <Icon className="fas fa-eye" style={{ width: "1.25em" }} />
                                        </ListItemIcon>*/
                                    }
                                </ListItem>

                                <ListItem>
                                    <ListItemText primary={t.__("Nom vernaculaire")} secondary={observation.commonSpeciesName || t.__("Non renseigné")} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={t.__("Degré de confiance de l'observateur")}
                                        secondary={t.__(observation.confident ? "Confiant" : "Peu confiant")}
                                    />
                                </ListItem>
                            </List>
                            <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="primary" variant="contained" startIcon={<NearMe />} onClick={async () => { await this.updateLocalStorage(); this.goTo("/map") }}>
                                    {t.__("Voir sur la map")}
                                </Button>
                            </Box>
                            
                            <ListItem>
                                <ListItemText primary={t.__("Vous pouvez modifier le relevé ou bien confirmer que les informations sont correctes")} />
                            </ListItem>
                            
                            <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="primary" variant="contained" startIcon={<Edit />} onClick={() => this.editObservation()}>
                                    {t.__("Modifier")}
                                </Button>
                                {this.state.displayConfirmButton &&
                                    <Button color="secondary" disabled={this.state.isValidated} variant="contained" startIcon={<Check />} onClick={() => this.validateObservation()}>
                                        {t.__("Confirmer")}
                                    </Button>
                                }
                            </Box>
                            
                            <ListItem>
                                <ListItemText primary={t.__("Si aucun arbre n'est présent, vous pouvez tagger ce relévé douteux")}/>
                            </ListItem>
                         
                            <Typography component="div">
                                <Grid component="label" container alignItems="center" spacing={1} className={clsx(classes.switchGrid)}>
                                    <Grid item>
                                        <InputLabel className={clsx(classes.label)}>{t.__("Non douteux")}</InputLabel>
                                    </Grid>
                                    <Grid item>
                                        <Switch
                                            title="Douteux"
                                            onChange={(e, val) => { alert("TODO")}}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <InputLabel className={clsx(classes.label)}>
                                            {t.__("Douteux")}
                                        </InputLabel>
                                    </Grid>
                                </Grid>
                            </Typography>

                            {   enableDeleteButton && 
                                <>
                                
                                    <ListItem>
                                        <ListItemText primary={t.__("Supprimer le relevé, cette opération est définitive")} />
                                    </ListItem>
                                    <Box className={clsx(classes.buttonsDiv)}>
                                        <Button color="secondary" variant="contained" startIcon={<Delete />} fullWidth onClick={() => this.remove()}>

                                            {t.__("Supprimer")}
                                        </Button>
                                    </Box>
                                  
                                </>
                            }
                            
                        </>
                    }
                    {
                        this.state.currentTab === "photo" &&
                        <>{observation.pictures.map((img, i) =>
                            <div style={{ margin: "0 auto" }} key={"photo" + i} >
                                <img src={`/api/observations/picture/${observation.id}/${i}`} key={"photo" + i} style={{ maxWidth: "100vw", margin: "0 auto", marginTop: "3px" }} />
                             </div>
                                )}
                        </>
                    }

                </Box>
            </>
        )
    }
}

export const ObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ObservationPageComponent)));