import { Box, createStyles, Icon, Theme, WithStyles, withStyles } from "@material-ui/core";
import clsx from "clsx";
import { LatLng } from "leaflet";
import React from "react";
import { Circle, Map, Marker, TileLayer } from "react-leaflet";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Confirm } from "../../components/confirm";
import { AuthenticationApi } from "../../services/authentication-service";
import { ObservationModel } from "../../services/generated/observation-model";
import { ObservationsApi } from "../../services/observation";
import { t } from "../../services/translation-service";

const styles = (theme: Theme) => createStyles({
    root: {
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        maxWidth: "100vw",
        minWidth: "100vw",
    },

    map: {
        height: "calc(100vh - 120px)",
        width: "100vw",
        maxWidth: "100vw",
        position: "relative",
        overflow: "hidden"
    },
    loading: {
        padding: theme.spacing(3)
    }
});

interface MapPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class MapPageState {
    userPosition: Position = null;
    observations: ObservationModel[];
}

class MapPageComponent extends BaseComponent<MapPageProps, MapPageState>{
    constructor(props: MapPageProps) {
        super(props, "MapPage", new MapPageState());
    }

    async componentDidMount() {       

        navigator.geolocation.getCurrentPosition(async (position) => {

            await this.setState({
                userPosition: position
            });

            this.positionWatcher = navigator.geolocation.watchPosition(async (position: Position) => {
                await this.setState({
                    userPosition: position
                })
            });
        });

        ObservationsApi.registerObservationsListener(() => this.loadObservations());

        this.loadObservations();
    }

    async loadObservations() {
        const observations = await ObservationsApi.getObservations();
        console.log("observations found", observations && observations.length);

        if (!this.unmounted) {
            await this.setState({ observations: observations });
        }
    }

    unmounted = false;
    positionWatcher: number = null;

    async componentWillUnmount() {

        this.unmounted = true;

        if (this.positionWatcher) {
            navigator.geolocation.clearWatch(this.positionWatcher);
        }

        ObservationsApi.unregisterObservationsListener(() => this.loadObservations());
    }

    async onMapClicked(e: { latlng: LatLng }) {

        if (!await Confirm(t.__("Voulez vous réaliser un nouveau relevé ?"))) {
            return;
        }

        await ObservationsApi.setNextObservationCoordinates(e.latlng);

        this.props.history.push({
            pathname: "new-observation"
        });
    }

    getTilesUrl() {
        if (document.location.host.indexOf("localhost") > -1) {
            return "//wxs.ign.fr/choisirgeoportail/geoportail/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}"
        } else {
            return "//wxs.ign.fr/1zk8fc4pfkpf90fgudlyn643/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal";
        }
    }

    getColor(observation: ObservationModel) {
        if (observation.isIdentified) {
            return "blue";
        }
        return AuthenticationApi.user.id === observation.userId ? "red" : "lime";
    }

    render() {

        const { classes } = this.props;

        const position = this.state.userPosition && { lat: this.state.userPosition.coords.latitude, lng: this.state.userPosition.coords.longitude };

        return (
            <Box className={clsx(classes.root)}>
                {
                    this.state.userPosition &&
                    <Map
                        className={clsx(classes.map)}
                        center={position}
                        zoom={22}
                        onclick={(e) => this.onMapClicked(e)}
                    >
                        <TileLayer
                            url={this.getTilesUrl()}
                            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                        />

                        <Marker
                            position={{ lat: this.state.userPosition.coords.latitude, lng: this.state.userPosition.coords.longitude }}
                        />

                        {
                            this.state.observations && this.state.observations.map((observation) => {
                                return (
                                    <Circle
                                        key={observation.id}
                                        center={{ lat: observation.latitude, lng: observation.longitude }}
                                        radius={6}
                                        color={this.getColor(observation)}
                                        onclick={() => this.props.history.push({ pathname: `/observation/${observation.id}` })}
                                    />
                                )
                            })
                        }

                    </Map>
                }
                {
                    !this.state.userPosition &&
                    <Box className={clsx(classes.loading)}>
                        <Icon className="fas fa-sync fa-spin fa-fw" /> {t.__("Chargement...")}
                    </Box>
                }
            </Box>
        )
    }
}

export const MapPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(MapPageComponent)));