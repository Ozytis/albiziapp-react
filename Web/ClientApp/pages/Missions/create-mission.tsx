﻿import { Container, createStyles, Theme, WithStyles, withStyles, Box, Typography, FormControl, Input, Select, MenuItem, Button } from "@material-ui/core";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { t } from "../../services/translation-service";
import { IdentificationMissionModel, NewObservationMissionModel, NewObservationMissionType, TimeLimit, NumberOfActions, PolygonArea, CircleAreaModel, CoordinateModel } from "../../services/models/mission-model";
import { Timelapse } from "@material-ui/icons";
import { Polygon } from "react-leaflet";
import { Circle } from "leaflet";
import { MissionsApi } from "../../services/missions-service";


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
});

interface CreateMissionProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class CreateMissionState {
    constructor() {
        this.model.type = -1;
        this.model.endingCondition = new NumberOfActions();
        this.endOfCondition = 0;
        this.zoneType = 0;
    }
    model = new NewObservationMissionModel();
    endOfCondition: number;
    zoneType: number;
}

class CreateMissionComponent extends BaseComponent<CreateMissionProps, CreateMissionState>{
    constructor(props: CreateMissionProps) {
        super(props, "CreateMissionPage", new CreateMissionState());
    }
    async updateModel(propertyName: string, value: any) {
        console.log(propertyName, value);
        const model = this.state.model;
        model[propertyName] = value;
        await this.setState({ model: model });
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
        await this.setState({ model : model });
    }
    async send() {
        console.log(this.state.model);

        //MissionsApi.createNewMission(this.state.model);
    }

    render() {

        const { classes } = this.props;

        return (
            <Container fixed className={clsx(classes.root)}>

                <h2>Création d'une mission</h2>
                <Box className={clsx(classes.root)} >
                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Type de mision")}
                    </Typography>

                    <FormControl className={clsx(classes.formControl)}>
                        <span>Effectuez des nouveaux relevés</span>
                    </FormControl>
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
                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Restriction sur les nouveaux relevés")}
                    </Typography>
                    <Select
                        label={t.__("Restriction")}
                        value={this.state.model.type}
                        onChange={e => { console.log(e.target.value); this.updateModel("type", e.target.value as string) }}
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

                    {(this.state.model.type == NewObservationMissionType.ExactGender || this.state.model.type == NewObservationMissionType.ExactSpecies) &&
                        <>
                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Genre ou espèce spécifique?")}
                            </Typography>

                            <FormControl className={clsx(classes.formControl)}>
                                <Input type="text" value={this.state.model.description} onChange={e => this.updateModel("description", e.target.value)} />
                            </FormControl>
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
                            <Input type="text" value={(this.state.model.endingCondition as NumberOfActions).number} onChange={e => this.updateEndingConditionValue( e.target.value)} />
                            </FormControl>
                        </>
                    }
                    {(this.state.model.endingCondition != null && this.state.endOfCondition == 1) &&
                        <>
                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Temps en minutes")}
                            </Typography>

                            <FormControl className={clsx(classes.formControl)}>
                            <Input type="text" value={(this.state.model.endingCondition as TimeLimit).minutes} onChange={e => this.updateEndingConditionValue( e.target.value)} />
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

                            <FormControl className={clsx(classes.formControl)}>
                                <Input type="text" value={(this.state.model.restrictedArea as CircleAreaModel).center.latitude} onChange={e => this.updateLatitudeCircle(e.target.value)} placeholder="Latitude" />
                                <Input type="text" value={(this.state.model.restrictedArea as CircleAreaModel).center.longitude} onChange={e => this.updateLongitudeCircle(e.target.value)} placeholder="Longitude" />
                            </FormControl>

                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Radius (en m)")}
                            </Typography>

                            <FormControl className={clsx(classes.formControl)}>
                                <Input type="text" value={(this.state.model.restrictedArea as CircleAreaModel).radius} onChange={e => this.updateRadiusCircle(e.target.value)} placeholder="Radius" />
                            </FormControl>
                        </>
                    }
                    {(this.state.model.restrictedArea != null && this.state.zoneType == 2) &&
                        <>
                            <Button onClick={() => { this.addPointToPolygon() }}  >Ajouter un point</Button>
                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Polygone (Le dernier point, doit être égale au premier)")}
                            </Typography>
                            {(this.state.model.restrictedArea as PolygonArea).polygon.map((p, i) =>
                            (
                                <>
                                    <FormControl className={clsx(classes.formControl)}>
                                        <Input type="text" value={p.latitude} onChange={e => this.updateLatitudePolygon(i, e.target.value)} placeholder="Latitude" />
                                        <Input type="text" value={p.longitude} onChange={e => this.updateLongitudePolygon(i, e.target.value)} placeholder="Longitude" />
                                        <Button onClick={() => { this.removePointToPolygon(i) }}  >Retirer le point</Button>
                                    </FormControl>
                                </>
                            ))
                            }
                        </>
                        }
                    </Box>
                    
                    <Button color="secondary" variant="contained" className="button button-primary  button-block mb-1"
                        onClick={() => this.send()}>
                        Envoyer
                                    </Button>
                </Box>

            </Container >
        )
    }
}

export const CreateMissionPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(CreateMissionComponent)));