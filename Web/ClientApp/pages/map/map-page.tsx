import { Box, createStyles, Icon, Theme, WithStyles, withStyles, Button, Dialog, DialogActions } from "@material-ui/core";
import clsx from "clsx";
import L, { LatLng } from "leaflet";
import React, { createRef, Component } from "react";
import { Circle, Map, Marker, TileLayer, LayerGroup } from "react-leaflet";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Confirm } from "../../components/confirm";
import { AuthenticationApi } from "../../services/authentication-service";
import { ObservationModel } from "../../services/generated/observation-model";
import { ObservationsApi } from "../../services/observation";
import { t } from "../../services/translation-service";
import { MissionsApi } from "../../services/missions-service";
import { ActivityModel } from "../../services/generated/activity-model";
import { MissionProgressionModel } from "../../services/generated/mission-progression-model";
import { NearMe, ZoomOutMapSharp, MapRounded } from "@material-ui/icons";
import { MapPosition } from "../../components/mapPosition";
import * as signalR from "@microsoft/signalr";

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
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.secondary.contrastText,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
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
    currentActivity: ActivityModel;
    missionProgression: MissionProgressionModel;
    zoomLevel: number = 0;
    mapRef = createRef<Map>();
    isLayerOn: boolean;
    layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 19,
        maxZoom : 21
    });
}

class MapPageComponent extends BaseComponent<MapPageProps, MapPageState>{

    hub: signalR.HubConnection;

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
            console.log("MAP ERROR");
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
            var obs = await ObservationsApi.getNearestObservations(this.state.userPosition.coords.latitude,this.state.userPosition.coords.longitude);
            this.setState({observations:obs})
        });
        this.hub.start();
        
        
        var missions = await MissionsApi.getMissions();
        var userMissions = await AuthenticationApi.getUserMission();
        var currentMission = missions.find(m => m.id == userMissions.missionProgression.missionId);
        var currentActivityId = userMissions.missionProgression.activityId;
        if (currentMission != null && currentActivityId != null) {
            var activity = currentMission.activities.find(a => a.id == currentActivityId);
            await this.setState({
                currentActivity: activity,
                missionProgression: userMissions.missionProgression
            });
        }

        await this.setPosition();
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
                    console.log([lastPos.Latitude, lastPos.Longitude], lastPos.Zoom);
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
            return "//wxs.ign.fr/3urbr0dt1qgjytxdkbt6z3cq/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal";
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


    render() {

        const { classes } = this.props;

        const position = this.state.userPosition && { lat: this.state.userPosition.coords.latitude, lng: this.state.userPosition.coords.longitude };

        return (
            <Box className={clsx(classes.root)}>
                {
                    this.state.userPosition && this.state.mapRef &&

                    <Map
                        ref={this.state.mapRef}
                        className={clsx(classes.map)}
                        style={{ "height": window.innerHeight -180+"px" }}
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
                            this.state.observations && this.state.observations.map((observation) => {
                                return (
                                    <Circle
                                        key={observation.id}
                                        fillOpacity={this.getOppacity(observation)}
                                        center={{ lat: observation.latitude, lng: observation.longitude }}
                                        radius={6}
                                        color={this.getColor(observation)}
                                        className={clsx(classes.imageClignote)}
                                        onclick={() => this.props.history.push({ pathname: `/observation/${observation.id}` })}
                                    />
                                )
                            })
                        }

                    </Map>

                }
                {
                    <Button style={{
                        position: "absolute",
                        top: "9%",
                        right: "3%",
                        padding: "10px",
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
                        top: "16%",
                        right: "3%",
                        padding: "10px",
                        zIndex: 400,
                        backgroundColor: "#f4f4f4",
                        color: "black",
                        textAlign: "center"
                    }}
                        onClick={() => this.changeLayer()}
                    >
                        <MapRounded />
                    </Button>

                }
                {
                    !this.state.userPosition &&
                    <Box className={clsx(classes.loading)}>
                        <Icon className="fas fa-sync fa-spin fa-fw" /> {t.__("Chargement...")}
                    </Box>
                }
                {this.state.currentActivity != null &&
                    <Box className={clsx(classes.missionBox)}>{this.state.currentActivity.instructions.long}
                        {this.state.currentActivity.endConditions && this.state.currentActivity.endConditions.length > 0 && this.state.currentActivity.endConditions[0] && this.state.currentActivity.endConditions[0].actionCount != null &&
                            <div>{this.state.missionProgression.progression ?? 0}/{this.state.currentActivity.endConditions[0].actionCount}</div>
                        }
                    </Box>
                }

            </Box>
        )
    }
}

export const MapPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(MapPageComponent)));