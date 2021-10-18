import { Container, createStyles, Theme, WithStyles, withStyles, Box, Typography, FormControl, Input, Select, MenuItem, Button, List, ListItem, Switch, ListItemText, Grid } from "@material-ui/core";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { t } from "../../services/translation-service";
import { IdentificationMissionModel, NewObservationMissionModel, NewObservationMissionType, TimeLimit, NumberOfActions, PolygonArea, CircleAreaModel, CoordinateModel, VerificationMissionModel, RestrictionType, Restriction } from "../../services/models/mission-model";
import { MissionsApi } from "../../services/missions-service";
import { ErrorSummary } from "../../components/error-summary";

const styles = (theme: Theme) => createStyles({
    root: {
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
    sectionHeading: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        color: theme.palette.primary.dark
    },
    formControl: {
        margin: theme.spacing(1),
        width: `calc(100% - ${theme.spacing(2)}px)`,
        color: theme.palette.common.black
    },
    select: {
        flexBasis: "100%",
        width: "100%"
    },
    marginTop2: {
        marginTop: "2rem"
    },
    marginTop1: {
        marginTop: "1rem"
    },
    switchTitle: {
        color: theme.palette.primary.dark,
        fontWeight: 800,
        fontSize: "1.25rem"
    },
    ulNoPadding: {
        paddingLeft: "7px"
    }
});

interface CreateMissionProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class CreateMissionState {
    constructor() {
        this.model = new NewObservationMissionModel();
        (this.model as NewObservationMissionModel).type = -1;
        this.model.endingCondition = new NumberOfActions();
        this.endOfCondition = 0;
        this.zoneType = 0;

    }
    model: NewObservationMissionModel | VerificationMissionModel | IdentificationMissionModel;
    endOfCondition: number;
    zoneType: number;
    errors: string[];
    missionType: number = 1;
    restrictionType: number = -1;
}

class CreateMissionComponent extends BaseComponent<CreateMissionProps, CreateMissionState>{
    constructor(props: CreateMissionProps) {
        super(props, "CreateMissionPage", new CreateMissionState());
    }

    async updateModel(propertyName: string, value: any) {
        const model = this.state.model;
        model[propertyName] = value;
        await this.setState({ model: model });
    }

    async updateMissionType(value: number) {
        var model = this.state.model;
        if (value == 1) {
            model = new NewObservationMissionModel();
            model.endingCondition = new NumberOfActions();
        } else if (value == 2) {
            model = new VerificationMissionModel();
            model.endingCondition = new NumberOfActions();
        } else if (value == 3) {
            model = new IdentificationMissionModel();
            model.endingCondition = new NumberOfActions();
            model.observationIdentified = [];
        }
        this.setState({ missionType: value, model: model });
    }
    async updateEndingCondition(value: number) {


        var model = this.state.model;
        if (value == 0) {
            model.endingCondition = new NumberOfActions();
        } else {
            model.endingCondition = new TimeLimit();
        }
        await this.setState({ endOfCondition: value, model: model });
    }

    async updatezone(value: number) {


        var model = this.state.model;
        if (value == 1) {
            model.restrictedArea = new CircleAreaModel();
            (model.restrictedArea as CircleAreaModel).center = { latitude: null, longitude: null };
        } else if (value == 2) {
            model.restrictedArea = new PolygonArea();
            (model.restrictedArea as PolygonArea).polygon = [];
        } else {
            model.restrictedArea = null;
        }
        await this.setState({ zoneType: value, model: model });
    }

    async updateRestriction(value) {
        var model = this.state.model;
        if (value == -1) {
            (model as IdentificationMissionModel).restriction = null;
        } else {
            (model as IdentificationMissionModel).restriction = new Restriction();
            (model as IdentificationMissionModel).restriction.type = value;
        }
        await this.setState({ model: model, restrictionType: value });
    }
    async updateRestrictionValue(value) {
        var model = this.state.model;
        (model as IdentificationMissionModel).restriction.value = value;

        await this.setState({ model: model });
    }

    async addObservationToIdentify() {
        var model = this.state.model as IdentificationMissionModel;

        model.observationIdentified.push("");
        await this.setState({ model: model });
    }

    async removeObservationToIdentify(index: number) {
        var model = this.state.model as IdentificationMissionModel;
        model.observationIdentified.splice(index, 1);
        await this.setState({ model: model });
    }

    async updateObservationId(index: number, value) {
        var model = this.state.model as IdentificationMissionModel;
      
      
        model.observationIdentified[index] = value;
      
        await this.setState({ model: model });
    }

    async addPointToPolygon() {
        var model = this.state.model;
        (model.restrictedArea as PolygonArea).polygon.push({ latitude: null, longitude: null });
        await this.setState({ model: model });
    }

    async removePointToPolygon(index: number) {
        var model = this.state.model;
        (model.restrictedArea as PolygonArea).polygon.splice(index, 1);
        await this.setState({ model: model });
    }

    async updateLongitudePolygon(index: number, value) {
        var model = this.state.model;
        var coord = (model.restrictedArea as PolygonArea).polygon[index];
        coord.longitude = value;
        await this.setState({ model: model });
    }

    async updateLatitudePolygon(index: number, value) {
        var model = this.state.model;
        var coord = (model.restrictedArea as PolygonArea).polygon[index];
        coord.latitude = value;
        await this.setState({ model: model });
    }
    async updateLongitudeCircle(value) {
        var model = this.state.model;
        var coord = (model.restrictedArea as CircleAreaModel).center;
        coord.longitude = value;
        await this.setState({ model: model });
    }

    async updateLatitudeCircle(value) {
        var model = this.state.model;
        var coord = (model.restrictedArea as CircleAreaModel).center;
        coord.latitude = value;
        await this.setState({ model: model });
    }
    async updateRadiusCircle(value) {
        var model = this.state.model;
        (model.restrictedArea as CircleAreaModel).radius = value;
        await this.setState({ model: model });
    }
    async updateEndingConditionValue(value) {
        var model = this.state.model;
        var endCondition = model.endingCondition;
        if (this.state.model.endingCondition != null && this.state.endOfCondition == 0) {
            (endCondition as NumberOfActions).number = value;
        } else if (this.state.model.endingCondition != null && this.state.endOfCondition == 1) {
            (endCondition as TimeLimit).minutes = value;
        }
        await this.setState({ model: model });
    }
    async send() {
        await this.checkModel();
        
        if (this.state.errors?.length <= 0 || this.state.errors == undefined || this.state.errors == null) {
        
            MissionsApi.createNewMission(this.state.model);
            this.props.history.replace({
                pathname: "/"
            })
        }
    }
    async checkModel() {
        var errors = [];
        if (this.state.model.endingCondition.$type.indexOf("NumberOfActionsModel") != -1) {
            const nbActions = this.state.model.endingCondition as NumberOfActions;
            if (nbActions.number == null || nbActions.number <= 0) {
                errors.push("-Le nombre d'action n'est pas renseigné");
            }
        }
        else if (this.state.model.endingCondition.$type.indexOf("TimeLimitModel") != -1) {
           
            const timeLimit = this.state.model.endingCondition as TimeLimit;
            if (timeLimit.minutes == null || timeLimit.minutes <= 0) {
                errors.push("-Le temps limite n'est pas renseigné");
            }
        }
        if ((this.state.model as NewObservationMissionModel).type != -1) {
            if ((this.state.model as NewObservationMissionModel).type == NewObservationMissionType.ExactGender || (this.state.model as NewObservationMissionModel).type == NewObservationMissionType.ExactSpecies) {
               
                if ((this.state.model as NewObservationMissionModel).type == NewObservationMissionType.ExactGender && ((this.state.model as NewObservationMissionModel).value == "" || (this.state.model as NewObservationMissionModel).value == null)) {
                    errors.push("-Le genre précis n'est pas renseigné");
                }
                else if ((this.state.model as NewObservationMissionModel).type == NewObservationMissionType.ExactSpecies && ((this.state.model as NewObservationMissionModel).value == "" || (this.state.model as NewObservationMissionModel).value == null)) {
                    errors.push("-L'èspece précise n'est pas renseignée");
                }
            }
        }
        if (this.state.model.title == null || this.state.model.title == "") {
            errors.push("-Le titre n'est pas renseigné");
        }
        if (this.state.model.description == null || this.state.model.description == "") {
            errors.push("-La description n'est pas renseigné");
        }
        if (this.state.model.restrictedArea != null && this.state.model.restrictedArea != undefined) {
            if (this.state.model.restrictedArea.$type.indexOf("CircleAreaModel") != -1) {
                const circle = this.state.model.restrictedArea as CircleAreaModel;
                if (circle.radius == null || circle.radius <= 0) {
                    errors.push("-Le radius de la zone n'est pas renseigné");

                }
                if (circle.center == null || circle.center.latitude == null || circle.center.longitude == null) {
                    errors.push("-Le point central n'est pas renseigné");
                }
            }
            else if (this.state.model.restrictedArea.$type.indexOf("PolygonAreaModel") != -1) {
                const polygon = this.state.model.restrictedArea as PolygonArea;

                if (polygon.polygon == null) {
                    errors.push("-Les coordonnées du polygone ne sont pas renseigné");
                }
                if (polygon.polygon != null && polygon.polygon.length <= 3 && polygon.polygon[0].latitude != polygon.polygon[polygon.polygon.length - 1].latitude || polygon.polygon[0].longitude != polygon.polygon[polygon.polygon.length - 1].longitude) {
                    errors.push("-Le dernier point n'est pas égal au premier");
                }
                if (polygon.polygon != null && polygon.polygon.length <= 3) {
                    errors.push("-Le polygone ne contient pas assez de points(3 mini)");
                }
            }
        }
        await this.setState({ errors: errors });
    }

    render() {

        const { classes } = this.props;

        return (
            <Container fixed className={clsx(classes.root)}>
                {this.state.errors &&
                    <ErrorSummary errors={this.state.errors} />
                }
                <Box  >
                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Type de mision")}
                    </Typography>
                    <Select
                        label={t.__("Type de mision")}
                        value={this.state.missionType}
                        onChange={e => { this.updateMissionType(e.target.value as number) }}
                        className={clsx(classes.select)}
                    >
                        <MenuItem key={`missionType-${1}`} value={1} >
                            {t.__("Effectuez des nouveaux relevés")}
                        </MenuItem>
                        <MenuItem key={`newObsType-${2}`} value={2} >
                            {t.__("Vérifiez des relevés non fiables")}
                        </MenuItem>
                        <MenuItem key={`newObsType-${3}`} value={3} >
                            {t.__("Reconnaissez-vous ces arbres ?")}
                        </MenuItem>

                    </Select>
                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Titre")}
                    </Typography>

                    <FormControl className={clsx(classes.formControl)}>
                        <Input type="text" value={this.state.model.title} onChange={e => this.updateModel("title", e.target.value)} />
                    </FormControl>
                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Description")}
                    </Typography>

                    <FormControl className={clsx(classes.formControl)}>
                        <Input type="text" value={this.state.model.description} onChange={e => this.updateModel("description", e.target.value)} />
                    </FormControl>
                    {this.state.missionType == 1 &&
                        <>
                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Restriction sur les nouveaux relevés")}
                            </Typography>
                            <Select
                                label={t.__("Restriction")}
                                value={(this.state.model as NewObservationMissionModel).type}
                                onChange={e => {this.updateModel("type", e.target.value as string) }}
                                className={clsx(classes.select)}
                            >
                                <MenuItem key={"non"} value={-1}>
                                    {t.__("Aucune restriction")}
                                </MenuItem>

                                <MenuItem key={`newObsType-${NewObservationMissionType.DifferentGenders}`} value={NewObservationMissionType.DifferentGenders} >
                                    {t.__("Genres différents")}
                                </MenuItem>
                                <MenuItem key={`newObsType-${NewObservationMissionType.DifferentSpecies}`} value={NewObservationMissionType.DifferentSpecies} >
                                    {t.__("Espèce différents")}
                                </MenuItem>
                                <MenuItem key={`newObsType-${NewObservationMissionType.ExactGender}`} value={NewObservationMissionType.ExactGender} >
                                    {t.__("Genre spécifique")}
                                </MenuItem>
                                <MenuItem key={`newObsType-${NewObservationMissionType.ExactSpecies}`} value={NewObservationMissionType.ExactSpecies} >
                                    {t.__("Espèce spécifique")}
                                </MenuItem>

                            </Select>

                            {((this.state.model as NewObservationMissionModel).type == NewObservationMissionType.ExactGender || (this.state.model as NewObservationMissionModel).type == NewObservationMissionType.ExactSpecies) &&
                                <>
                                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                        {t.__("Genre ou espèce spécifique?")}
                                    </Typography>

                                    <FormControl className={clsx(classes.formControl)}>
                                        <Input type="text" value={(this.state.model as NewObservationMissionModel).value} onChange={e => this.updateModel("value", e.target.value)} />
                                    </FormControl>
                                </>
                            }
                        </>
                    }
                    {this.state.missionType == 2 &&
                        <>

                            <List style={{ marginTop: "auto", marginRight: "auto" }}>
                                <ListItem className={clsx(classes.ulNoPadding)}>
                                    <ListItemText primary={t.__("Observation incertaines")} className={clsx(classes.switchTitle)} />
                                    <Switch onChange={e => this.updateModel("unreliableObservation", e.target.value)} value={(this.state.model as VerificationMissionModel).unreliableObservation} color="primary" />
                                </ListItem>
                                <ListItem className={clsx(classes.ulNoPadding)}>
                                    <ListItemText primary={t.__("Observation avec photos uniquement")} className={clsx(classes.switchTitle)} />
                                    <Switch onChange={e => this.updateModel("observationWithPics", e.target.value)} value={(this.state.model as VerificationMissionModel).observationWithPics} color="primary" />
                                </ListItem>
                            </List>
                        </>
                    }

                    {(this.state.missionType == 2 || this.state.missionType == 3) &&
                        <>
                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Restriction")}
                            </Typography>
                            <Select
                                label={t.__("Restriction")}
                                value={this.state.restrictionType}
                                onChange={e => { this.updateRestriction(e.target.value) }}
                                className={clsx(classes.select)}
                            >
                                <MenuItem key={"non"} value={-1}>
                                    {t.__("Aucune restriction")}
                                </MenuItem>
                                <MenuItem key={`newObsType-${RestrictionType.ExactGender}`} value={RestrictionType.ExactGender} >
                                    {t.__("Genre spécifique")}
                                </MenuItem>
                                <MenuItem key={`newObsType-${RestrictionType.ExactSpecies}`} value={RestrictionType.ExactSpecies} >
                                    {t.__("Espèce spécifique")}
                                </MenuItem>

                            </Select>
                            {(this.state.restrictionType == RestrictionType.ExactGender || this.state.restrictionType == RestrictionType.ExactSpecies) &&

                                <>
                                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                        {t.__("Genre ou espèce spécifique?")}
                                    </Typography>

                                    <FormControl className={clsx(classes.formControl)}>
                                        <Input type="text" value={(this.state.model as IdentificationMissionModel).restriction.value} onChange={e => this.updateRestrictionValue(e.target.value)} />
                                    </FormControl>
                                </>
                            }
                        </>
                    }
                    {this.state.missionType == 3 &&
                        <>
                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Relevé à identifier (id)")}
                            </Typography>
                            <Button color="primary" variant="contained" className={clsx(classes.marginTop1, "button button-primary  button-block mb-1")} onClick={() => { this.addObservationToIdentify() }}>Ajouter un relevé</Button>
                            {(this.state.model as IdentificationMissionModel).observationIdentified.map((o, i) =>
                            (<>

                                <Grid container spacing={1} key={"oIds"+i }>
                                    <Grid item xs={10}>
                                        <FormControl className={clsx(classes.formControl)}>
                                            <Input type="text" value={o} onChange={e => this.updateObservationId(i, e.target.value)} placeholder="Id (Guid)" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Button color="secondary" variant="contained" className="button button-primary  button-block mb-1" style={{ width: "max-content" }} onClick={() => { this.removeObservationToIdentify(i) }}>Retirer le relevé</Button>
                                    </Grid>
                                </Grid>

                            </>
                            ))
                            }
                        </>
                    }


                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Condition de fin")}
                    </Typography>
                    <Select
                        label={t.__("Condition de fin")}
                        value={this.state.endOfCondition}
                        onChange={e => this.updateEndingCondition(e.target.value as number)}
                        className={clsx(classes.select)}
                    >

                        <MenuItem key={`eoc-${0}`} value={0} >
                            {t.__("Nombre d'action")}
                        </MenuItem>
                        <MenuItem key={`eoc-${1}`} value={1} >
                            {t.__("Minutes")}
                        </MenuItem>

                    </Select>
                    <Box>
                        {(this.state.model.endingCondition != null && this.state.endOfCondition == 0) &&
                            <>
                                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                    {t.__("Nombre d'action")}
                                </Typography>

                                <FormControl className={clsx(classes.formControl)}>
                                    <Input required type="text" value={(this.state.model.endingCondition as NumberOfActions).number} onChange={e => this.updateEndingConditionValue(e.target.value)} />
                                </FormControl>
                            </>
                        }
                        {(this.state.model.endingCondition != null && this.state.endOfCondition == 1) &&
                            <>
                                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                    {t.__("Temps en minutes")}
                                </Typography>

                                <FormControl className={clsx(classes.formControl)}>
                                    <Input required type="text" value={(this.state.model.endingCondition as TimeLimit).minutes} onChange={e => this.updateEndingConditionValue(e.target.value)} />
                                </FormControl>
                            </>
                        }
                    </Box>
                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Zone")}
                    </Typography>
                    <Select
                        label={t.__("Condition de fin")}
                        value={this.state.zoneType}
                        onChange={e => this.updatezone(e.target.value as number)}
                        className={clsx(classes.select)} >

                        <MenuItem key={`zone-${0}`} value={0} >
                            {t.__("Aucune zone")}
                        </MenuItem>
                        <MenuItem key={`zone-${1}`} value={1} >
                            {t.__("Cercle")}
                        </MenuItem>
                        <MenuItem key={`zone-${2}`} value={2} >
                            {t.__("Polygone")}
                        </MenuItem>

                    </Select>
                    <Box>
                        {(this.state.model.restrictedArea != null && this.state.zoneType == 1) &&
                            <>
                                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                    {t.__("Centre")}
                                </Typography>

                                <Grid container spacing={1}>
                                    <Grid item xs={5}>
                                        <FormControl className={clsx(classes.formControl)}>

                                            <Input type="text" value={(this.state.model.restrictedArea as CircleAreaModel).center.latitude} onChange={e => this.updateLatitudeCircle(e.target.value)} placeholder="Latitude" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <FormControl className={clsx(classes.formControl)}>
                                            <Input type="text" value={(this.state.model.restrictedArea as CircleAreaModel).center.longitude} onChange={e => this.updateLongitudeCircle(e.target.value)} placeholder="Longitude" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <FormControl className={clsx(classes.formControl)}>
                                            <Input type="text" value={(this.state.model.restrictedArea as CircleAreaModel).radius} onChange={e => this.updateRadiusCircle(e.target.value)} placeholder="Radius (en m)" />
                                        </FormControl>
                                    </Grid>
                                </Grid>



                            </>
                        }
                        {(this.state.model.restrictedArea != null && this.state.zoneType == 2) &&
                            <>
                                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                    {t.__("Polygone (Le dernier point, doit être égale au premier)")}
                            </Typography>
                            <Button color="primary" variant="contained" className={clsx(classes.marginTop1, "button button-primary  button-block mb-1")}  onClick={() => { this.addPointToPolygon() }}  >Ajouter un point</Button>

                                {(this.state.model.restrictedArea as PolygonArea).polygon.map((p, i) =>
                                (
                                    <>
                                        <Grid container spacing={1}>
                                            <Grid item xs={5}>
                                                <FormControl className={clsx(classes.formControl)}>
                                                    <Input type="text" value={p.latitude} onChange={e => this.updateLatitudePolygon(i, e.target.value)} placeholder="Latitude" />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={5}>
                                                <FormControl className={clsx(classes.formControl)}>
                                                    <Input type="text" value={p.longitude} onChange={e => this.updateLongitudePolygon(i, e.target.value)} placeholder="Longitude" />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Button color="secondary" variant="contained" className="button button-primary  button-block mb-1" style={{ width: "max-content" }} onClick={() => { this.removePointToPolygon(i) }}  >Retirer le point</Button>

                                            </Grid>
                                        </Grid>
                                    </>
                                ))
                                }
                            </>
                        }
                    </Box>

                    <Button color="primary" variant="contained" className={clsx(classes.marginTop2, "button button-primary  button-block mb-1 ")}
                        onClick={() => this.send()}>
                        Envoyer
                    </Button>
                </Box>

            </Container >
        )
    }
}

export const CreateMissionPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(CreateMissionComponent)));