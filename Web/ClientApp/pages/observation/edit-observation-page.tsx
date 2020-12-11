import { Box, Button, createStyles, FormControl, Grid, InputLabel, MenuItem, Select, Switch, Theme, Typography, WithStyles, withStyles, TextField, Modal, IconButton, RadioGroup, Radio, FormControlLabel } from "@material-ui/core";
import { Undo, Close } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
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
import { ObservationEditionModel } from "../../services/generated/observation-edition-model";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { SpeciesInfoComponent } from "../species/species-info-component";
import { StringHelper } from "../../utils/string-helper";


const styles = (theme: Theme) => createStyles({
    root: {
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: theme.spacing(1),
        color: theme.palette.common.white
    },
    sectionHeading: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        color: theme.palette.primary.light
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
});

interface EditObservationPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class EditObservationPageState {

    constructor() {
        const coordinates = ObservationsApi.getNextObservationCoordinates();
        this.model.latitude = coordinates[0];
        this.model.longitude = coordinates[1];
    }

    isProcessing = false;
    errors: string[];
    model = new ObservationEditionModel();
    speciesData: SpeciesModel[];
    genusData: TreeGenusModel[];
    commonGenus: TreeGenusModel;
    genus: TreeGenusModel;

    speciesName: SpeciesModel;
    speciesCommonName: SpeciesModel;
    loaded: boolean;
    showModalSpecied = false;
}

class EditObservationPageComponent extends BaseComponent<EditObservationPageProps, EditObservationPageState>{
    constructor(props: EditObservationPageProps) {
        super(props, "EditObservationPage", new EditObservationPageState());
    }

    async componentDidMount() {
        if (!this.state.model.latitude) {
            this.props.history.push({
                pathname: "/map"
            })
        }
        const observation = await ObservationsApi.getObservation(this.props.match.params["observationid"]);
        var model = new ObservationEditionModel();
        console.log(observation);
        model.id = observation.id;
        model.genus = observation.genus;
        //model.image = observation.i
        model.isConfident = observation.confident;
        model.latitude = observation.latitude;
        model.longitude = observation.longitude;
        model.species = observation.speciesName;
        model.commonGenus = observation.commonGenus;
        model.commonSpeciesName = observation.commonSpeciesName;


        await this.setState({ model: model });


        AuthenticationApi.refreshUser();

        this.listener = SpeciesApi.registerSpeciesListener(() => this.refreshSpecies());

        await this.refreshSpecies();
        await this.updateCommonGenus(model.commonGenus);
        await this.updateGenus(model.genus);
        await this.updateCommon(model.commonSpeciesName);
        await this.updateSpecies(model.species);
        await this.setState({ loaded: true });
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

        await this.setState({ genusData: genus, speciesData: species });
    }

    async updateModel(propertyName: string, value: any) {
        console.log(propertyName, value);
        const model = this.state.model;
        model[propertyName] = value;
        await this.setState({ model: model });
    }

    async cancelCreation() {
        ObservationsApi.setNextObservationCoordinates(null);
        await this.props.history.push({
            pathname: "/observations"
        });
    }

    async updateCommonGenus(commonGenus: string) {
        const model = this.state.model;
        const genus = this.state.genusData.find(g => g.commonGenus === commonGenus);
        if (genus != null) {
            model.commonGenus = genus.commonGenus;
            await this.setState({ model: model, commonGenus: genus });
        } else {
            model.genus = null;
            await this.setState({ model: model, commonGenus: null });
        }

        await this.clearConfident();
    }

    async updateCommon(common: string) {
        const model = this.state.model;
        const species = this.state.speciesData.find(g => g.commonSpeciesName === common);
        if (species != null) {
            model.species = species.speciesName;
            await this.setState({ model: model, speciesCommonName: species });
        } else {
            model.species = null;
            await this.setState({ model: model, speciesCommonName: null });
        }

        await this.clearConfident();
    }

    async updateSpecies(speciesName: string) {
        const model = this.state.model;
        const species = this.state.speciesData.find(g => g.speciesName === speciesName);
        if (species != null) {
            model.species = species.speciesName;
            await this.setState({ model: model, speciesName: species });
        } else {
            model.species = null;
            await this.setState({ model: model, speciesName: null });
        }

        await this.clearConfident();
    }

    async updateGenus(genusName: string) {
        const model = this.state.model;
        const genus = this.state.genusData.find(g => g.genus === genusName);
        if (genus != null) {
            model.genus = genus.genus;
            await this.setState({ model: model, genus: genus });
        } else {
            model.genus = null;
            await this.setState({ model: model, genus: null });
        }
        await this.clearConfident();
    }

    async process() {
        console.log(this.state.model);
        if (this.state.isProcessing || !await Confirm(t.__("Etes vous sûr de vouloir valider ce relevé ?"))) {
            return;
        }

        await this.setState({ isProcessing: true, errors: [] });

        const result = await ObservationsApi.editObservation(this.state.model);

        if (!result.success) {
            await this.setState({
                isProcessing: false,
                errors: result.errors
            })
        }
        else {
            await this.setState({ isProcessing: false });
            this.props.history.push({
                pathname: "/observations"
            })
        }
    }


    findSpeciesTelaBotanicaTaxon() {
        var s = this.state.speciesData.find(x => x.speciesName == this.state.model.species);
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

    showConfident() {
        var state = this.state;
        return ( state.commonGenus != null || !StringHelper.isNullOrEmpty(state.model.genus) || state.speciesCommonName != null || !StringHelper.isNullOrEmpty(state.model.species));
    }

    render() {

        const { classes } = this.props;
        const { model } = this.state;
        let { speciesData, genusData } = this.state;

        if (!speciesData) {
            return (
                <Box className={clsx(classes.root)}>
                    <Loader loading /> {t.__("Chargement...")}
                </Box>
            )
        }

        if (model.genus && model.genus.length > 0) {
            speciesData = speciesData.filter(species => species.genus === model.genus);
        }

        if (model.species && model.species.length > 0 && (model.genus == null || model.genus.length == 0)) {
            let s = this.state.speciesData.filter(g => g.speciesName === model.species).map(s => s.genus);
            genusData = genusData.filter(g => s.indexOf(g.genus) != -1);
        }

        let commonGenus = [...genusData];
        commonGenus = commonGenus.sort((g1, g2) => g1.commonGenus.localeCompare(g2.commonGenus));
        let commonSpecies = [...speciesData];
        commonSpecies = commonSpecies.sort((s1, s2) => s1.commonSpeciesName.localeCompare(s2.commonSpeciesName));

        return (
            <>
                <Box className={clsx(classes.root)}>

                    <ErrorSummary errors={this.state.errors} />

                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Genre")}
                    </Typography>
                    {this.state.loaded != null &&
                        <>
                            <FormControl className={clsx(classes.formControl)}>

                                <Autocomplete
                                    id="commonGenusSelect"
                                options={commonGenus}
                                    getOptionLabel={(option: TreeGenusModel) => option.commonGenus}
                                    renderInput={(params) => <TextField {...params} label="Commun" variant="outlined" />}
                                    getOptionSelected={(o, v) => o.commonGenus == v?.commonGenus}
                                    value={this.state.commonGenus}
                                onChange={(e, v) => this.updateCommonGenus((v as any)?.commonGenus)}
                                />

                            </FormControl>

                            <FormControl className={clsx(classes.formControl)}>
                                <Autocomplete
                                    id="genusSelect"
                                    options={genusData.sort((g1, g2) => g1.genus.localeCompare(g2.genus))}
                                    getOptionLabel={(option: TreeGenusModel) => option.genus}
                                    renderInput={(params) => <TextField {...params} label="Latin" variant="outlined" />}
                                    value={this.state.genus}
                                    onChange={(e, v) => this.updateGenus((v as any)?.genus)}
                                />
                            </FormControl>

                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Espèce")}
                            </Typography>

                            <FormControl className={clsx(classes.formControl)}>
                                <Autocomplete
                                    id="speciesCommonNameSelect"
                                options={commonSpecies}
                                    getOptionLabel={(option: SpeciesModel) => option.commonSpeciesName}
                                    renderInput={(params) => <TextField {...params} label="Commune" variant="outlined" />}
                                    onChange={(e, v) => this.updateCommon((v as any)?.commonSpeciesName)}
                                    value={this.state.speciesCommonName}
                                />
                            </FormControl>

                            <FormControl className={clsx(classes.formControl)}>
                                <Autocomplete
                                    id="speciesNameSelect"
                                    options={speciesData.sort((s1, s2) => s1.speciesName.localeCompare(s2.speciesName))}
                                    getOptionLabel={(option: SpeciesModel) => option.speciesName}
                                    renderInput={(params) => <TextField {...params} label="Latine" variant="outlined" />}
                                    onChange={(e, v) => this.updateSpecies((v as any)?.speciesName)}
                                    value={this.state.speciesName}
                                />
                                {(this.state.model.species != null && this.state.model.species.length > 0) &&
                                    <a style={{ color: 'black' }} onClick={() => { this.goToSpeciesPage(); }}>Voir la fiche de l'espèce </a>
                                }
                            </FormControl>


                            {this.showConfident() &&
                                <>
                                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                        {t.__("Confiance")}
                                    </Typography>


                                    <RadioGroup value={model.isConfident} onChange={(event) => { this.updateModel("isConfident", event.target.value) }} >
                                        <FormControlLabel value={0} control={<Radio checked={model.isConfident == 0} />} label={t.__("Peu confiant")} className={clsx(classes.label)} />
                                        <FormControlLabel value={1} control={<Radio checked={model.isConfident == 1} />} label={t.__("Moyennement confiant")} className={clsx(classes.label)} />
                                        <FormControlLabel value={2} control={<Radio checked={model.isConfident == 2} />} label={t.__("Confiant")} className={clsx(classes.label)} />
                                    </RadioGroup>
                                </>
                            }

                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Photographie")}
                            </Typography>

                        <PhotoFormItem label={t.__("Prendre une photo")} value={model.pictures} onAdd={val => this.addPicture(val)} onDelete={index => this.deletePicture(index)} />
                        </>
                    }
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

export const EditObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(EditObservationPageComponent)));