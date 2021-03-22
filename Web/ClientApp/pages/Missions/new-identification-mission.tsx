import { Box, Button, createStyles, FormControl, Theme, Typography, WithStyles, withStyles, TextField} from "@material-ui/core";
import { Undo } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter, Route } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Loader } from "../../components/loader";
import { AuthenticationApi } from "../../services/authentication-service";
import { ObservationCreationModel } from "../../services/generated/observation-creation-model";
import { SpeciesModel } from "../../services/generated/species-model";
import { TreeGenusModel } from "../../services/models/tree-species";
import { ObservationsApi } from "../../services/observation";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { ObservationModel } from "../../services/generated/observation-model";
import { UserModel } from "../../services/generated/user-model";
import * as signalR from "@microsoft/signalr";
import { toast, ToastContainer } from "react-toastify";
import ReactDOM from "react-dom";

const styles = (theme: Theme) => createStyles({
    root: {        
        maxHeight: "calc(100vh - 120px)",
        height: "calc(" + window.innerHeight+"px - 112px)",
        overflowY: "auto",
        padding: theme.spacing(1),
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
        color: theme.palette.common.white
    },
    buttons: {
        marginTop: theme.spacing(2),
        color: theme.palette.common.white
    },

    label: {
        margin: theme.spacing(1),
        color: theme.palette.primary.light
    },
    modal: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(7),
        color: theme.palette.primary.contrastText,
        zIndex: 9999
    },
    center: {
        marginLeft: "auto",
        marginRight: "auto"
    },
    tabConfiance: {
        width: "20%",
        border: "solid 1px black",
        textAlign: "center",
        cursor: "pointer"
    },
    top: {
        marginTop: "2%"
    },
});

interface NewIdentificationMissionPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {
}

class NewIdentificationMissionPageState {

    constructor() {
        const coordinates = ObservationsApi.getNextObservationCoordinates();
        this.model.latitude = coordinates[0];
        this.model.longitude = coordinates[1];
    }

    isProcessing = false;
    errors: string[];
    model = new ObservationCreationModel();
    species: SpeciesModel[];
    genus: TreeGenusModel[];
    selectedCommonGenus: TreeGenusModel;
    selectedGenus: TreeGenusModel;
    selectedCommonSpecies: SpeciesModel;
    selectedspecies: SpeciesModel;
}

class NewIdentificationMissionPageComponent extends BaseComponent<NewIdentificationMissionPageProps, NewIdentificationMissionPageState>{
    constructor(props: NewIdentificationMissionPageProps) {
        super(props, "NewObservationPage", new NewIdentificationMissionPageState());
    }

    async componentDidMount() {
        if (!this.state.model.latitude) {
            this.props.history.replace({
                pathname: "/map"
            })
        }
        AuthenticationApi.refreshUser();

        this.listener = SpeciesApi.registerSpeciesListener(() => this.refreshSpecies());

        await this.refreshSpecies();
    }

    listener: () => Promise<void>;

    async componentWillUnmount() {
        SpeciesApi.unregisterSpeciesListener(this.listener);
    }

    async refreshSpecies() {
        const [species, genus] = await Promise.all([
            SpeciesApi.getAllSpecies(),
            SpeciesApi.getAllGenus()
        ]);

        await this.setState({ genus: genus, species: species });
    }

    async updateModel(propertyName: string, value: any) {
        console.log(propertyName, value);
        const model = this.state.model;
        model[propertyName] = value;
        await this.setState({ model: model });
    }

    async goBack() {

            ObservationsApi.setNextObservationCoordinates(null);
            await this.props.history.replace({
                pathname: "/map"
            });        
    }

    async updateCommonGenus(commonGenus: string) {
        const model = this.state.model;
        const genus = this.state.genus.filter(g => g.commonGenus === commonGenus);
        if (genus != null && genus.length > 0) {
            model.genus = genus[0].genus;
            await this.setState({ model: model, selectedCommonGenus : genus[0] });
            if (genus.length == 1) {
                await this.updateGenus(genus[0].genus);
            }
        } else {
            model.genus = null;
            model.species = null;
            await this.setState({ model: model, selectedGenus: null, selectedCommonGenus: null, selectedCommonSpecies: null, selectedspecies: null });
        }
    }
    async updateGenus(genusName: string) {
        const model = this.state.model;
        const genus = this.state.genus.find(g => g.genus === genusName);
       
        if (genus != null) {
            model.genus = genus.genus;
            await this.setState({ model: model,  selectedGenus: genus  });         
            const speciesCount = this.state.species.filter(species => species.genus === model.genus);
            if (speciesCount.length == 1) {
                this.updateCommonSpecies(speciesCount[0].commonSpeciesName);
            }
        } else {
            model.genus = null;
            model.species = null;
            await this.setState({ model: model, selectedGenus: null, selectedCommonGenus: null, selectedCommonSpecies: null,selectedspecies : null });
        }
    }

    async updateCommonSpecies(commonSpecies: string) {
        const model = this.state.model;
        const species = this.state.species.filter(g => g.commonSpeciesName === commonSpecies);
        if (species != null && species.length > 0) {
            model.species = species[0].speciesName;
            const genus = this.state.genus.find(g => g.genus === species[0].genus);
            model.genus = genus.genus;
            await this.setState({ model: model, selectedCommonSpecies: species[0], selectedGenus: genus, selectedCommonGenus: genus, selectedspecies: species[0]  });
            if (species.length == 1) {
                this.updateSpecies(species[0].speciesName);
            }
        } else {
            model.species = null;
            await this.setState({ model: model,  selectedCommonSpecies: null, selectedspecies: null });
        }
    }

    async updateSpecies(speciesName: string) {
        const model = this.state.model;
        const species = this.state.species.find(g => g.speciesName === speciesName);
        if (species != null) {
            model.species = species.speciesName;
            const genus = this.state.genus.find(g => g.genus === species[0].genus);
            model.genus = genus.genus;
            await this.setState({ model: model, selectedspecies: species, selectedGenus: genus, selectedCommonGenus: genus, selectedCommonSpecies:species });
        } else {
            model.species = null;
            await this.setState({ model: model, selectedCommonSpecies: null, selectedspecies: null });
        }       
    }    
    blurField(id)
    {
        let element = document.getElementById(id);
        if (element != null) {
            element.blur();  
        }      
    }
    async checkIdentification() {
        this.sendNotify("test");
        const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
        if (observation.genus == this.state.model.genus) {
            if (observation.speciesName == this.state.model.species) {
                
            }
        }
    }
    async sendNotify(notifContent: string) {
        var hubConnection = new signalR.HubConnectionBuilder()
            .withUrl("/notifyhub")
            .build();
        hubConnection.on("SendNotif", function () {

            const notify = () => toast.success(notifContent, {
                position: toast.POSITION.BOTTOM_CENTER,
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            console.log("1");
            const element =
                <div onLoad={notify}>
                    <ToastContainer position="bottom-center"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover />
                </div>;
            console.log(element);
            console.log(document.getElementById('toast'));

            ReactDOM.render(element, document.getElementById('toast'));
            notify();
        });
    }
    
    render() {

        const { classes } = this.props;
        const { model, selectedCommonGenus, selectedCommonSpecies } = this.state;
        let { species, genus } = this.state;

        if (!species) {
            return (
                <Box className={clsx(classes.root)}>
                    <Loader loading /> {t.__("Chargement...")}
                </Box>
            )
        }

        if (model.genus && model.genus.length > 0) {
            species = species.filter(species => species.genus === model.genus);         
            genus = genus.filter(g => g.commonGenus == selectedCommonGenus?.commonGenus);            
        }

        if (model.species && model.species.length > 0 && (model.genus == null || model.genus.length == 0)) {
            let s = this.state.species.filter(g => g.speciesName === model.species).map(s => s.genus);
            genus = genus.filter(g => s.indexOf(g.genus) != -1);
        }

        if (selectedCommonSpecies != null) {
            species = species.filter(species => species.commonSpeciesName === selectedCommonSpecies.commonSpeciesName);         
        }
       
        let commonGenus = [...genus];
        commonGenus = commonGenus.sort((g1, g2) => g1.commonGenus.localeCompare(g2.commonGenus));
        let commonSpecies = [...species];
        commonSpecies = commonSpecies.sort((s1, s2) => s1.commonSpeciesName.localeCompare(s2.commonSpeciesName));
        return (
            <>
                <Box className={clsx(classes.root)} >                    

                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Genre")}
                    </Typography>

                    <FormControl className={clsx(classes.formControl)}>
                        <Autocomplete                         
                            id="commonGenusSelect"
                            options={commonGenus}
                            getOptionLabel={(option: TreeGenusModel) => option?.commonGenus ?? ""}
                            renderInput={(params) => <TextField {...params} label="Commun" variant="outlined" />}
                            value={this.state.selectedCommonGenus || ''}
                            onChange={(e, v) => {
                                this.updateCommonGenus((v as any)?.commonGenus); 
                            }}
                            onClose={() => {this.blurField("commonGenusSelect");}}
                        />
                    </FormControl>

                    <FormControl className={clsx(classes.formControl)}>
                        <Autocomplete
                            id="GenusSelect"
                            options={genus.sort((g1, g2) => g1.genus.localeCompare(g2.genus))}
                            getOptionLabel={(option: TreeGenusModel) => option?.genus ?? ""}
                            value={this.state.selectedGenus || ""}
                            renderInput={(params) => <TextField {...params} label="Latin" variant="outlined" />}
                            onChange={(e, v) => { this.updateGenus((v as any)?.genus); }}
                            onClose={() => { this.blurField("GenusSelect"); }}
                        />

                    </FormControl>

                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Espèce")}
                    </Typography>

                    <FormControl className={clsx(classes.formControl)}>
                        <Autocomplete
                            id="commonSpeciesSelect"
                            options={commonSpecies}
                            value={this.state.selectedCommonSpecies || ""}
                            getOptionLabel={(option: SpeciesModel) => option?.commonSpeciesName ?? ""}
                            renderInput={(params) => <TextField {...params} label="Commune" variant="outlined" />}
                            onChange={(e, v) => { this.updateCommonSpecies((v as any)?.commonSpeciesName); }}
                            onClose={() => { this.blurField("commonSpeciesSelect"); }}         
                        />
                    </FormControl>

                    <FormControl className={clsx(classes.formControl)}>
                        <Autocomplete
                            id="SpeciesSelect"
                            options={species.sort((s1, s2) => s1.speciesName.localeCompare(s2.speciesName))}
                            value={this.state.selectedspecies || ""}
                            getOptionLabel={(option: SpeciesModel) => option?.speciesName ?? ""}
                            renderInput={(params) => <TextField {...params} label="Latine" variant="outlined" />}
                            onChange={(e, v) => { this.updateSpecies((v as any)?.speciesName); }}
                            onClose={() => { this.blurField("SpeciesSelect"); }} 
                        />
                        
                    </FormControl>
                    
                    <Button color="primary" variant="contained" fullWidth className={clsx(classes.buttons)} onClick={() => this.checkIdentification()}>
                        <Loader loading={this.state.isProcessing} usualIcon="check" />
                        {t.__("Valider")}
                    </Button>

                    <Button color="secondary" variant="contained" className={clsx(classes.buttons)} onClick={() => this.goBack()} fullWidth>
                        <Undo />
                        {t.__("Annuler")}
                    </Button>
                </Box>                
            </>
        )
    }
}

export const NewIdentificationMissionPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(NewIdentificationMissionPageComponent)));