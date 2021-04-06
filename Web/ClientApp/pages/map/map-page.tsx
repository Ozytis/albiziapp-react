import { Box, createStyles, Icon, Theme, WithStyles, withStyles, Button, Dialog, DialogActions } from "@material-ui/core";
import clsx from "clsx";
import L, { LatLng, latLng } from "leaflet";
import React, { createRef, Component, useState, useEffect } from "react";
import { Circle, Map, Marker, TileLayer, LayerGroup, Polygon, Polyline } from "react-leaflet";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Confirm } from "../../components/confirm";
import { AuthenticationApi } from "../../services/authentication-service";
import { ObservationModel } from "../../services/generated/observation-model";
import { ObservationsApi } from "../../services/observation";
import { t } from "../../services/translation-service";
import { MissionsApi } from "../../services/missions-service";
import { MissionProgressionModel } from "../../services/generated/mission-progression-model";
import { NearMe, ZoomOutMapSharp, MapRounded, Layers } from "@material-ui/icons";
import { MapPosition } from "../../components/mapPosition";
import * as signalR from "@microsoft/signalr";
import { MissionModel, CircleAreaModel, PolygonArea, IdentificationMissionModel, VerificationMissionModel, RestrictionType, NumberOfActions, TimeLimit } from "../../services/models/mission-model";
import { CoordinateModel } from "../../services/generated/coordinate-model";
import { orange } from "@material-ui/core/colors";
import { NotifyHelper } from "../../utils/notify-helper";
import { MissionHistoryModel } from "../../services/generated/mission-history-model";

const styles = (theme: Theme) => createStyles({
    root: {
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        maxWidth: "100vw",
        minWidth: "100vw",
    },
    map: {

        width: "100vw",
        maxWidth: "100vw",
        position: "relative",
        overflow: "hidden"
    },
    loading: {
        padding: theme.spacing(3)
    },
    missionBox: {
        height: "60px",
        backgroundColor: "#267F00",
        color: theme.palette.secondary.contrastText,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1%",
        verticalAlign: "middle"
    },
    imageClignote: {
        animationDuration: ".8s",
        animationName: "clignoter",
        animationIterationCount: "infinite",
        transition: "none"
    }
});

interface MapPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class MapPageState {
    userPosition: Position = null;
    observations: ObservationModel[];
    currentMission: MissionModel;
    missionProgression: MissionProgressionModel;
    zoomLevel: number = 0;
    mapRef = createRef<Map>();
    isLayerOn: boolean;
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 19,
        maxZoom: 21
    });
    circle: CircleAreaModel;
    polygon: PolygonArea;
    minutes: number = 0;
    seconds: number = 0;
    timer: number;
    myInterval: number;
    history: MissionHistoryModel[];
    poly: L.LatLng[];
}

class MapPageComponent extends BaseComponent<MapPageProps, MapPageState>{

    hub: signalR.HubConnection;
    myInterval: number;
    constructor(props: MapPageProps) {
        super(props, "MapPage", new MapPageState());
    }

    async componentDidMount() {
        navigator.geolocation.getCurrentPosition(async (position) => {
            await this.setState({
                userPosition: position
            });
            this.loadObservations();
            this.positionWatcher = navigator.geolocation.watchPosition(async (position: Position) => {
                await this.setState({
                    userPosition: position
                })
            });
        }, async () => {
            await this.setState({
                userPosition: {
                    coords: ({ latitude: 48.085834, longitude: -0.757896 } as any)
                } as any
            });
        });

        this.hub = new signalR.HubConnectionBuilder()
            .withUrl("/positionhub")
            .build();



        this.hub.on("Refresh", async () => {
            var obs = await ObservationsApi.getNearestObservations(this.state.userPosition.coords.latitude, this.state.userPosition.coords.longitude);
            this.setState({ observations: obs })
        });
        this.hub.start();
        await this.loadData();
    }
    async loadData() {

        var missions = await MissionsApi.getMissions();
        var userMissions = await AuthenticationApi.getUserMission();
        const history = await MissionsApi.getHistoryMission();
        var currentMission = missions.find(m => m.id == userMissions.missionProgression?.missionId);
        console.log(currentMission);
        var missionProgression = userMissions.missionProgression;
        await this.setState({ currentMission: currentMission, missionProgression: missionProgression, history: history });
        await this.setPosition();
        this.setZoneForMission();
        if (currentMission != null && missionProgression != null) {
            if (currentMission.endingCondition.$type.indexOf("TimeLimitModel") != -1) {
                const timeLimit = this.state.currentMission.endingCondition as TimeLimit;
                const start = new Date(missionProgression.startDate);
                console.log(start);
                var timer = timeLimit.minutes;
                timer = timer * 60;
                const startInSeconds = start.getHours() * 60 + start.getMinutes() * 60 + start.getSeconds();
                const endInSeconds = startInSeconds + timer;
                const now = new Date();
                var nowInSeconds = now.getHours() * 60 + now.getMinutes() * 60 + now.getSeconds();
                var secRestante = endInSeconds - nowInSeconds;
                if (secRestante > 0) {
                    var minRestante = secRestante / 60;
                    minRestante = Math.trunc(minRestante);
                    secRestante = secRestante - (minRestante * 60);
                    await this.setState({ minutes: minRestante, seconds: secRestante, timer: timeLimit.minutes });
                    this.timer();
                }
                else {
                    await MissionsApi.timerIsEnd(this.state.currentMission?.id);
                }
            }
        }
    }
    async setPosition() {

        var lastPos: MapPosition = JSON.parse(localStorage.getItem("mapPosition"));

        var now = new Date();
        now = new Date(now.getTime() - 30 * 60000);

        if (this.state.mapRef.current != null) {
            if (lastPos == null) {
                await this.state.mapRef.current.leafletElement.panTo([this.state.userPosition.coords.latitude, this.state.userPosition.coords.longitude]);
            } else {
                var date = new Date(lastPos.Date as any);
                if (date >= now) {
                    await this.state.mapRef.current.leafletElement.setView([lastPos.Latitude, lastPos.Longitude], lastPos.Zoom);
                }
                else {

                    await this.state.mapRef.current.leafletElement.panTo([this.state.userPosition.coords.latitude, this.state.userPosition.coords.longitude]);
                }
            }
        }
    }

    async loadObservations() {
        var obs = await ObservationsApi.getNearestObservations(this.state.userPosition.coords.latitude, this.state.userPosition.coords.longitude);
        this.setState({ observations: obs })
    }

    unmounted = false;
    positionWatcher: number = null;

    async componentWillUnmount() {

        this.unmounted = true;

        if (this.positionWatcher) {
            navigator.geolocation.clearWatch(this.positionWatcher);
        }
        clearTimeout(this.myInterval)
    }

    async onMapClicked(e: { latlng: LatLng }) {

        const zoomLvl = this.state.mapRef.current.leafletElement.getZoom();

        if (zoomLvl >= 15) {
            if (!await Confirm(t.__("Voulez vous réaliser un nouveau relevé ?"))) {
                return;
            }

            await ObservationsApi.setNextObservationCoordinates(e.latlng);

            this.props.history.push({
                pathname: "new-observation"
            });
        }
        else {
            await ObservationsApi.notifError(AuthenticationApi.getCurrentUser().osmId, "Le niveau de zoom est trop haut pour créer un nouveau relevé");
            return;
        }
    }

    getTilesUrl() {
        if (document.location.host.indexOf("localhost") > -1 || document.location.host.indexOf("192.168.1.") > -1) {
            return "//wxs.ign.fr/choisirgeoportail/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
        } else {
            if (document.location.host.indexOf("albiziapp.ozytis.fr") > -1) {
                return "//wxs.ign.fr/3urbr0dt1qgjytxdkbt6z3cq/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal";
            } else if (document.location.host.indexOf("albiziapp2.ozytis.fr") > -1) {
                return "//wxs.ign.fr/5ts1y3n87hinjyxnu8j9l9ev/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal";
            }
        }
    }

    getColor(observation: ObservationModel) {
        if (observation.isIdentified) {
            return "lime";
        }
        else {
            return "orange";
        }
    }

    async setLastPosition(lat: number, lng: number, zoom: number) {

        var now = new Date();
        localStorage.setItem("mapPosition", JSON.stringify({ Latitude: lat, Longitude: lng, Zoom: zoom, Date: now } as MapPosition));
        if (this.hub.state == signalR.HubConnectionState.Connected) {
            this.hub.send("SetPosition", lat, lng);
        }

        if (zoom >= 13) {
            const observations = await ObservationsApi.getNearestObservations(lat, lng);
            await this.setState({ observations: observations });
        }
        else await this.setState({ observations: null });
    }

    getOppacity(observation: ObservationModel) {

        return AuthenticationApi.user.osmId === observation.userId ? 0.5 : 0;
    }

    goToUserLocation() {

        this.state.mapRef.current.leafletElement.setView([this.state.userPosition.coords.latitude, this.state.userPosition.coords.longitude], 18);
    }

    changeLayer() {

        if (!this.state.isLayerOn) {
            this.state.mapRef.current.leafletElement.addLayer(this.state.layer);
            this.setState({ isLayerOn: true });
        }
        else if (this.state.isLayerOn) {
            this.state.mapRef.current.leafletElement.removeLayer(this.state.layer);
            this.setState({ isLayerOn: false });
        }

    }

    async setZoneForMission() {
        const mission = this.state.currentMission;
        if (mission.restrictedArea != null && mission.restrictedArea != undefined) {
            if ((mission.restrictedArea as CircleAreaModel).center != null) {
                const model = mission.restrictedArea as CircleAreaModel;
                await this.setState({ circle: model });
            }
            else {
                const model = mission.restrictedArea as PolygonArea;
                await this.setState({ polygon: model });
            }
        }
    }
    checkIfObservationIsInMission(observation: ObservationModel) {
        if (this.state.currentMission != null) {
            if (this.state.currentMission.$type.indexOf("IdentificationMissionModel") != -1 && observation.isCertain) {
                const mission = this.state.currentMission as IdentificationMissionModel;
                if (mission.observationIdentified != null && mission.observationIdentified.length > 0) {
                    if (mission.observationIdentified.includes(observation.id)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                if (mission.restrictedArea != null && mission.restrictedArea != undefined) {
                    if (!this.concernByZone(mission, observation)) {
                        return false;
                    }
                }
                if (mission.restriction != null) {
                    if (mission.restriction.species != "") {
                        if (!observation.observationStatements.some(x => x.speciesName == mission.restriction.species)) {
                            return false;
                        }
                    }
                    if (mission.restriction.species == "" && mission.restriction.genus != "") {
                        if (!observation.observationStatements.some(x => x.genus == mission.restriction.genus)) {
                            return false;
                        }
                    }
                }
                if (this.state.history != null) {
                    console.log(this.state.history)
                    if (this.state.history.some(x => x.observationId == observation.id && x.recognition == true)) {
                        return false;
                    }
                }
                return true;
            }
            else if (this.state.currentMission.$type.indexOf("VerificationMissionModel") != -1) {
                const mission = this.state.currentMission as VerificationMissionModel;
                if (mission.restrictedArea != null && mission.restrictedArea != undefined) {
                    if (!this.concernByZone(mission, observation)) {
                        return false;
                    }
                }
                if (mission.restriction != null) {
                    if (mission.restriction.species != "") {
                        if (!observation.observationStatements.some(x => x.speciesName == mission.restriction.species)) {
                            return false;
                        }
                    }
                    if (mission.restriction.species == "" && mission.restriction.genus != "") {
                        if (!observation.observationStatements.some(x => x.genus == mission.restriction.genus)) {
                            return false;
                        }
                    }
                }
                if (mission.observationWithPics) {
                    if (observation.pictures == null || observation.pictures.length <= 0) {
                        return false;
                    }
                }
                if (mission.unreliableObservation) {
                    if (!observation.isIdentified) {
                        return false;
                    }
                }
                return true;
            }
            else {
                return false;
            }
        }
    }
    isMarkerInsidePolygon(lat, lng, poly) {
        var polyPoints = poly.getLatLngs();
        var x = lat
        var y = lng;
        var inside = false;

        for (var ii = 0; ii < poly.getLatLngs().length; ii++) {
            var polyPoints = poly.getLatLngs()[ii];
            for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
                var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
                var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

                var intersect = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
        }
        return inside;
    }
    concernByZone(miss: MissionModel, observation: ObservationModel) {
        var mission;
        if (miss.$type == "VerificationMissionModel") {
            mission = miss as VerificationMissionModel;
        }
        else if (miss.$type == "IdentificationMissionModel") {
            mission = miss as IdentificationMissionModel;
        }
        if ( mission.restrictedArea != null && mission.restrictedArea != undefined) {
            if ((mission.restrictedArea as CircleAreaModel).center != null) {
                const circle = mission.restrictedArea as CircleAreaModel;
                var cir = L.circle(latLng(circle.center.latitude, circle.center.longitude), circle.radius);
                var circleCenterPoint = cir.getLatLng();
                return (circleCenterPoint.distanceTo(latLng(observation.latitude, observation.longitude)) <= circle.radius);
            }
            else {
                const polygon = mission.restrictedArea as PolygonArea;
                var poly = L.polygon(polygon.polygon.map(p => latLng(p.latitude, p.longitude)));
                return this.isMarkerInsidePolygon(observation.latitude, observation.longitude, poly);
            }
        }

    }

    checkConditionEnding() {
        if (this.state.currentMission != null && this.state.missionProgression != null) {
            if (this.state.currentMission.endingCondition.$type.indexOf("NumberOfActionsModel") != -1) {
                const nbActions = this.state.currentMission.endingCondition as NumberOfActions;
                const progression = this.state.missionProgression.progression ? this.state.missionProgression.progression : 0;
                return progression + "/" + nbActions.number;
            }
            else {
                const seconds = this.state.seconds;
                if (seconds < 10) {
                    return this.state.minutes + ":0" + seconds;
                }
                else {
                    return this.state.minutes + ":" + seconds;
                }
            }
        }
    }
    IsMissionIdentification() {
        if (this.state.currentMission != null) {
            if (this.state.currentMission.$type.indexOf("IdentificationMissionModel") != -1) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    async timer() {
        this.myInterval = setTimeout(() => {
            const { seconds, minutes } = this.state;
            if (seconds > 0) {
                this.setState(({ seconds }) => ({
                    seconds: seconds - 1
                }))
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    clearTimeout(this.myInterval)
                } else {
                    this.setState(({ minutes }) => ({
                        minutes: minutes - 1,
                        seconds: 59
                    }))
                }
            }
            this.timer();
        }, 1000);
        if (this.state.minutes == 0 && this.state.seconds == 0) {
            clearTimeout(this.myInterval);
            NotifyHelper.sendInfoNotif("Le temps est écoulé");
            await MissionsApi.timerIsEnd(this.state.currentMission?.id);
            await this.loadData();
        }
    }
    render() {

        const { classes } = this.props;
        const { minutes, seconds } = this.state;

        const position = this.state.userPosition && { lat: this.state.userPosition.coords.latitude, lng: this.state.userPosition.coords.longitude };

        return (
            <Box className={clsx(classes.root)}>
                {
                    this.state.userPosition && this.state.mapRef &&

                    <Map
                        ref={this.state.mapRef}
                        className={clsx(classes.map)}
                        style={{ "height": window.innerHeight - 180 + "px" }}
                        center={position}
                        zoom={21}
                        zoomSnap={0.5}
                        minZoom={5}
                        onclick={(e) => this.onMapClicked(e)}
                        onmoveend={() => this.setLastPosition(this.state.mapRef.current.leafletElement.getCenter().lat, this.state.mapRef.current.leafletElement.getCenter().lng, this.state.mapRef.current.leafletElement.getZoom())}
                        setView
                    >
                        <TileLayer
                            url={this.getTilesUrl()}
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                            maxNativeZoom={19}
                            maxZoom={21}

                        />

                        <Marker
                            position={{ lat: this.state.userPosition.coords.latitude, lng: this.state.userPosition.coords.longitude }}
                        />
                        {
                            this.state.circle &&
                            <Circle
                                center={[this.state.circle.center.latitude, this.state.circle.center.longitude]}
                                radius={this.state.circle.radius}
                                stroke-opacity={0.5}
                                color={"orange"}
                                fillOpacity={0}
                                interactive={false}
                            />
                        }
                        {
                            this.state.polygon &&
                            <Polygon
                                positions={this.state.polygon.polygon.map(p => latLng(p.latitude, p.longitude))}
                                stroke-opacity={0.5}
                                color={"orange"}
                                fillOpacity={0}
                                interactive={false}

                            />
                        }

                        {
                            this.state.observations && this.state.observations.map((observation) => {
                                return (
                                    <Circle
                                        key={observation.id}
                                        fillOpacity={this.checkIfObservationIsInMission(observation) ? 0 : this.getOppacity(observation)}
                                        center={{ lat: observation.latitude, lng: observation.longitude }}
                                        radius={6}
                                        color={this.checkIfObservationIsInMission(observation) ? "red" : this.getColor(observation)}
                                        className={clsx(classes.imageClignote)}
                                        onclick={this.checkIfObservationIsInMission(observation) && this.IsMissionIdentification() ? (() => this.props.history.push({ pathname: `/new-identification-mission/${observation.id}` })) : (() => this.props.history.push({ pathname: `/observation/${observation.id}` }))}

                                    />
                                )
                            })
                        }
                    </Map>

                }
                {
                    <Button style={{
                        position: "absolute",
                        top: "10%",
                        right: "3%",
                        padding: "4px",
                        minWidth: 0,
                        width: "auto",
                        zIndex: 400,
                        backgroundColor: "#f4f4f4",
                        color: "black",
                        textAlign: "center"
                    }}
                        onClick={() => this.goToUserLocation()}
                    >
                        <NearMe />
                    </Button>

                }
                {
                    <Button style={{
                        position: "absolute",
                        top: "15%",
                        right: "3%",
                        padding: "4px",
                        minWidth: 0,
                        width: "auto",
                        zIndex: 400,
                        backgroundColor: "#f4f4f4",
                        color: "black",
                        textAlign: "center"
                    }}
                        onClick={() => this.changeLayer()}
                    >
                        <Layers />
                    </Button>

                }
                {
                    !this.state.userPosition &&
                    <Box className={clsx(classes.loading)}>
                        <Icon className="fas fa-sync fa-spin fa-fw" /> {t.__("Chargement...")}
                    </Box>
                }
                <Box className={clsx(classes.missionBox)}>
                    {this.state.currentMission != null && this.state.currentMission != undefined ? (<div style={{ textAlign: "center" }}><p>{this.state.currentMission.description}</p> <p>{this.checkConditionEnding()}</p></div>) : (<div>Aucune mission séléctionnée</div>)}

                </Box>


            </Box>
        )
    }
}

export const MapPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(MapPageComponent)));