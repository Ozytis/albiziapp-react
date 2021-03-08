import { Box, Button, createStyles, FormControl, Grid, InputLabel, MenuItem, Select, Switch, Theme, Typography, WithStyles, withStyles, TextField, Modal, IconButton, RadioGroup, FormControlLabel, Radio } from "@material-ui/core";
import { Undo, Router, Close } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter, Route } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Confirm } from "../../components/confirm";
import { ErrorSummary } from "../../components/error-summary";
import { Loader } from "../../components/loader";
import { PhotoFormItem } from "../../components/photo-form-item";
import { AuthenticationApi } from "../../services/authentication-service";
import { ObservationCreationModel } from "../../services/generated/observation-creation-model";
import { SpeciesModel } from "../../services/generated/species-model";
import { TreeGenusModel } from "../../services/models/tree-species";
import { ObservationsApi } from "../../services/observation";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";
import Autocomplete from '@material-ui/lab/Autocomplete';
import { SpeciesInfoComponent } from "../species/species-info-component";
import { StringHelper } from "../../utils/string-helper";
import { MapPosition } from "../../components/mapPosition";

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

interface NewObservationPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {
}

class NewObservationPageState {

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
    showModalSpecied = false;
    isLessThan2m: boolean;
    isBetween2And5m: boolean;
    isBetween5And10m: boolean;
    isMoreThan10m: boolean;  
    newTreeSize: number = null;
}

class NewObservationPageComponent extends BaseComponent<NewObservationPageProps, NewObservationPageState>{
    constructor(props: NewObservationPageProps) {
        super(props, "NewObservationPage", new NewObservationPageState());
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

    async addPicture(value: any) {
        
        const model = this.state.model;
        if (model.pictures == null) {
            model.pictures = [];
        }
        model.pictures.push(value);
        await this.setState({ model: model });
    }
    async deletePicture(index: any) {

        const model = this.state.model;
        if (model.pictures == null) {
           
            return;
        }
        model.pictures.splice(index, 1);
        await this.setState({ model: model });
    }

    async cancelCreation() {
        if (!this.props.match.params["observationid"]) {
            ObservationsApi.setNextObservationCoordinates(null);
            await this.props.history.replace({
                pathname: "/map"
            });
        }
        else if (this.props.match.params["observationid"]) {
            await this.props.history.replace({
                pathname: "/observation/" + this.props.match.params["observationid"]
            });
        }
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
        await this.clearConfident();
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
            await this.setState({ model: model,  selectedGenus: null, selectedCommonSpecies: null,selectedspecies : null });
        }
        await this.clearConfident();
    }

    async updateCommonSpecies(commonSpecies: string) {
        const model = this.state.model;
        const species = this.state.species.filter(g => g.commonSpeciesName === commonSpecies);
        if (species != null && species.length > 0) {
            model.species = species[0].speciesName;
            await this.setState({ model: model, selectedCommonSpecies : species[0] });
            if (species.length == 1) {
                this.updateSpecies(species[0].speciesName);
            }
        } else {
            model.species = null;
            await this.setState({ model: model,  selectedCommonSpecies: null, selectedspecies: null });
        }
        await this.clearConfident();
    }

    async updateSpecies(speciesName: string) {
        const model = this.state.model;
        const species = this.state.species.find(g => g.speciesName === speciesName);
        if (species != null) {
            model.species = species.speciesName;
            await this.setState({ model: model, selectedspecies : species });
        } else {
            model.species = null;
            await this.setState({ model: model, selectedCommonSpecies: null, selectedspecies: null });
        }       
        await this.clearConfident();
    }

    async setTreeSize(level: number) {

        if (level == 0) {
            if (this.state.isLessThan2m) {
                await this.setState({ isLessThan2m: false, newTreeSize: null})
            }
            else if (!this.state.isLessThan2m) {
                await this.setState({ isLessThan2m: true, isBetween2And5m: false, isBetween5And10m: false, isMoreThan10m: false, newTreeSize: 0 })
            }
        }

        if (level == 1) {
            if (this.state.isBetween2And5m) {
                await this.setState({ isBetween2And5m: false, newTreeSize: null})
            }
            else if (!this.state.isBetween2And5m) {
                await this.setState({ isBetween2And5m: true, isLessThan2m: false, isBetween5And10m: false, isMoreThan10m: false, newTreeSize: 1 })
            }
        }

        if (level == 2) {
            if (this.state.isBetween5And10m) {
                await this.setState({ isBetween5And10m: false, newTreeSize: null})
            }
            else if (!this.state.isBetween5And10m) {
                await this.setState({ isBetween5And10m: true, isLessThan2m: false, isBetween2And5m: false, isMoreThan10m: false, newTreeSize: 2 })
            }
        }
        if (level == 3) {
            if (this.state.isMoreThan10m) {
                await this.setState({ isMoreThan10m: false, newTreeSize: null})
            }
            else if (!this.state.isMoreThan10m) {
                await this.setState({ isMoreThan10m: true, isLessThan2m: false, isBetween2And5m: false, isBetween5And10m: false, newTreeSize: 3 })
            }
        }

    }



    async process() {
        if (!this.props.match.params["observationid"]) {
            if (this.state.isProcessing || !await Confirm(t.__("Etes vous sûr de vouloir valider ce relevé ?"))) {
                return;
            }

            var now = new Date();
            localStorage.setItem("mapPosition", JSON.stringify({ Latitude: this.state.model.latitude, Longitude: this.state.model.longitude, Zoom: 18, Date: now } as MapPosition));

            await this.setState({ isProcessing: true, errors: [] });

            this.state.model.treeSize = this.state.newTreeSize;

            const result = await ObservationsApi.createObservation(this.state.model);

            if (!result.success) {
                await this.setState({
                    isProcessing: false,
                    errors: result.errors
                })
            }
            else {
                await this.setState({ isProcessing: false });

                this.props.history.replace({
                    pathname: "/map"
                })
            }
        }
        else if (this.props.match.params["observationid"]) {

            const result = await ObservationsApi.addStatement(this.state.model, this.props.match.params["observationid"]);

            if (!result.success) {
                await this.setState({
                    isProcessing: false,
                    errors: result.errors
                })
            }
            else {
                await this.setState({ isProcessing: false });

                this.props.history.replace({
                    pathname: "/observation/" + this.props.match.params["observationid"]
                })

            }
        }

    }

    findSpeciesTelaBotanicaTaxon() {
        var s = this.state.species.find(x => x.speciesName == this.state.model.species);
        return s?.telaBotanicaTaxon;
    }

    async goToSpeciesPage() {
        await this.setState({ showModalSpecied: true });
    }

    async clearConfident() {
        if (!this.showConfident()) {
            var model = this.state.model;
            model.isConfident = null;
            await this.setState({ model: model });
        }
    }

    showConfident() {
        var state = this.state;        
        return (state.selectedCommonGenus != null || !StringHelper.isNullOrEmpty(state.model.genus) || state.selectedCommonSpecies != null || !StringHelper.isNullOrEmpty(state.model.species));
    }

    blurField(id)
    {
        let element = document.getElementById(id);
        if (element != null) {
            element.blur();  
        }      
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
                        {(this.state.model.species != null && this.state.model.species.length > 0) &&
                            <a style={{ color: 'black' }} onClick={() => { this.goToSpeciesPage(); }}>Voir la fiche de l'espèce </a>
                        }
                    </FormControl>

                    <Box className={clsx(classes.top)}>
                        <table className={clsx(classes.center)} style={{ width: "90%",color: "black" }}>
                            <tbody>
                                <tr>
                                    <td style={{ width: "20%" }}>Hauteur</td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isLessThan2m ? "green" : "white", color: this.state.isLessThan2m ? "white" : "black" }} onClick={() => this.setTreeSize(0)}>
                                        - de 2m
                                    </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isBetween2And5m ? "green" : "white", color: this.state.isBetween2And5m ? "white" : "black" }} onClick={() => this.setTreeSize(1)}>
                                        2m à 5m
                                </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isBetween5And10m ? "green" : "white", color: this.state.isBetween5And10m ? "white" : "black" }} onClick={() => this.setTreeSize(2)} >
                                        5m à 10m
                                </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isMoreThan10m ? "green" : "white", color: this.state.isMoreThan10m ? "white" : "black" }} onClick={() => this.setTreeSize(3)} >
                                        + de 10m
                                </td>
                                </tr>
                            </tbody>
                        </table>
                        </Box>
                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Photographie")}
                    </Typography>

                    <PhotoFormItem label={t.__("Prendre une photo")} value={model.pictures} onAdd={val => this.addPicture(val)} onDelete={index => this.deletePicture(index)} />

                    <Button color="primary" variant="contained" fullWidth className={clsx(classes.buttons)} onClick={() => this.process()}>
                        <Loader loading={this.state.isProcessing} usualIcon="check" />
                        {t.__("Valider")}
                    </Button>

                    <Button color="secondary" variant="contained" className={clsx(classes.buttons)} onClick={() => this.cancelCreation()} fullWidth>
                        <Undo />
                        {t.__("Annuler")}
                    </Button>

                </Box>
                <Modal
                    disableAutoFocus
                    className={clsx(classes.modal)}
                    open={this.state.showModalSpecied}
                    onClose={() => { this.setState({ showModalSpecied: false }) }}
                >
                    <>
                        <IconButton aria-label="Close" className={classes.closeButton} onClick={() => { this.setState({ showModalSpecied: false }) }}>
                            <Close />
                        </IconButton>
                        {this.state.model.species != null && this.state.model.species.length > 0 &&
                            <SpeciesInfoComponent speciesId={this.findSpeciesTelaBotanicaTaxon()} classes={null} />
                        }
                    </>
                </Modal>
            </>
        )
    }
}

export const NewObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(NewObservationPageComponent)));