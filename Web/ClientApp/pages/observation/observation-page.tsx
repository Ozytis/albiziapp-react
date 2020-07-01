import { Box, Button, createStyles, Grid, Icon, InputLabel, List, ListItem, ListItemIcon, ListItemText, Switch, Tab, Tabs, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { Check, Delete, Edit } from "@material-ui/icons";
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

const styles = (theme: Theme) => createStyles({
    root: {
        //backgroundColor: theme.palette.primary.main,
        maxWidth: "100vw",
        margin: 0,
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: "1vh 1vw 1vh 1vw"
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
}

class ObservationPageComponent extends BaseComponent<ObservationPageProps, ObservationPageState>{
    constructor(props: ObservationPageProps) {
        super(props, "ObservationPage", new ObservationPageState());
    }

    async componentDidMount() {
        const observation = await ObservationsApi.getObservation(this.props.match.params["observationid"]);
        await this.setState({ observation: observation });

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

    async goTo(path: string) {
        this.props.history.push({
            pathname: path
        });
    }

    render() {

        const { classes } = this.props;
        const { observation } = this.state;

        if (!observation) {
            return <>Chargement</>;
        }

        return (
            <>
                <Box className={clsx(classes.root)}>
                    <Tabs value={this.state.currentTab} onChange={(_, index) => this.setState({ currentTab: index })} aria-label="simple tabs example">
                        <Tab label={t.__("Informations")} className={clsx(classes.tab)} value="infos" />
                        {
                            observation.hasPicture &&
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
                                    <ListItemText primary={t.__("Espèce")} secondary={observation.speciesName || t.__("Non renseignée")} />
                                    {
                                        observation.telaBotanicaTaxon &&
                                        <ListItemIcon
                                            title={t.__("Espèce")}
                                            className={clsx(classes.tab)}
                                            onClick={() => this.goTo(`/specy/${observation.telaBotanicaTaxon}`)}
                                        >
                                            <Icon className="fas fa-eye" style={{ width: "1.25em" }} />
                                        </ListItemIcon>
                                    }
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={t.__("Nom vernaculaire")} secondary={observation.commonSpeciesName || t.__("Non renseignée")} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={t.__("Genre")} secondary={observation.genus || t.__("Non renseignée")} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={t.__("Genre vernaculaire")} secondary={observation.commonGenus || t.__("Non renseignée")} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary={t.__("Degré de confiance de l'observateur")}
                                        secondary={t.__(observation.confident ? "Confiant" : "Peu confiant")}
                                    />
                                </ListItem>
                            </List>

                            <Typography variant="body2">
                                <p className={clsx(classes.instructions)}>
                                    {t.__("Vous pouvez modifier le relevé ou bien confirmer que les informations sont correctes")}
                                </p>
                            </Typography>
                            <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="primary" variant="contained" startIcon={<Edit />}>
                                    {t.__("Modifier")}
                                </Button>
                                <Button color="secondary" disabled variant="contained" startIcon={<Check />}>
                                    {t.__("Confirmer")}
                                </Button>
                            </Box>
                            <Typography variant="body2">
                                <p className={clsx(classes.instructions)}>
                                    {t.__("Si aucun arbre n'est présent, vous pouvez tagger ce relévé douteux")}
                                </p>
                            </Typography>
                            <Typography component="div">
                                <Grid component="label" container alignItems="center" spacing={1} className={clsx(classes.switchGrid)}>
                                    <Grid item>
                                        <InputLabel className={clsx(classes.label)}>{t.__("Non douteux")}</InputLabel>
                                    </Grid>
                                    <Grid item>
                                        <Switch
                                            title="Douteux"
                                            checked={false}
                                            onChange={(e, val) => void (0)}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <InputLabel className={clsx(classes.label)}>
                                            {t.__("Douteux")}
                                        </InputLabel>
                                    </Grid>
                                </Grid>
                            </Typography>
                            <Typography variant="body2">
                                <p className={clsx(classes.instructions)}>
                                    {t.__("Supprimer le relevé, cette opération est définitive")}
                                </p>
                            </Typography>
                            <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="secondary" startIcon={<Delete />} fullWidth variant="contained" onClick={() => this.remove()}>

                                    {t.__("Supprimer")}
                                </Button>
                            </Box>
                        </>
                    }

                    {
                        this.state.currentTab === "photo" &&
                        <>
                            <img src={`/api/image/${observation.id}`} style={{ width: "100vw" }} />
                        </>
                    }

                </Box>
            </>
        )
    }
}

export const ObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ObservationPageComponent)));