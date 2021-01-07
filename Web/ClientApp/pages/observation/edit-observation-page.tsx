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
import { ObservationStatementEditionModel } from "../../services/generated/observation-statement-edition-model";
import { ObservationModel } from "../../services/generated/observation-model";
import { ObservationStatementModel } from "../../services/generated/observation-statement-model";


const styles = (theme: Theme) => createStyles({
    root: {
        height: "calc(" + window.innerHeight + "px - 112px)",
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
    }

    isProcessing = false;
    errors: string[];
    model :any;
    speciesData: SpeciesModel[];
    genusData: TreeGenusModel[];
    commonGenus: TreeGenusModel;
    genus: TreeGenusModel;
    observation: ObservationModel;
    statement: ObservationStatementModel;
    observationModel = new ObservationEditionModel();
    statementModel = new ObservationStatementEditionModel();
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

        const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
        const statement = await ObservationsApi.getStatement(this.props.match.params["observationid"], this.props.match.params["statementid"]);        
        await this.setState({ observation: observation,statement:statement })
        this.setModel();

        AuthenticationApi.refreshUser();

        this.listener = SpeciesApi.registerSpeciesListener(() => this.refreshSpecies());
        const model = this.state.model;
        console.log(model);
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

    async setModel() {
        

        if (this.state.statement) {
            const statement = this.state.statement;
            const model = new ObservationStatementEditionModel();
            model.id = statement.id;
            model.genus = statement.genus;
            model.species = statement.speciesName;
            model.commonGenus = statement.commonGenus;
            model.commonSpeciesName = statement.commonSpeciesName;
            await this.setState({ model: model });
        }
        else {
            const observation = this.state.observation;
            const model = new ObservationEditionModel();
            model.id = observation.id;
            model.genus = observation.genus;
            model.species = observation.speciesName;
            model.commonGenus = observation.commonGenus;
            model.commonSpeciesName = observation.commonSpeciesName;
            model.latitude = observation.latitude;
            model.longitude = observation.longitude;
            model.isConfident = observation.confident;
            await this.setState({ model: model });
        }
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

        if (this.props.match.params["statementid"]) {
            await this.props.history.replace({
                pathname: "/observation/" + this.props.match.params["observationid"]
            });
        }
        else {
            ObservationsApi.setNextObservationCoordinates(null);
            await this.props.history.push({
                pathname: "/observations"
            });
        }
    }

    async updateCommonGenus(commonGenus: string) {
        const model = this.state.model;
        const genus = this.state.genusData.filter(g => g.commonGenus === commonGenus);
        if (genus != null && genus.length > 0) {
            model.commonGenus = genus[0].commonGenus;
            await this.setState({ model: model, commonGenus: genus[0] });
            if (genus.length == 1) {
                await this.updateGenus(genus[0].genus);
            }
        } else {
            model.genus = null;
            model.species = null;
            await this.setState({ model: model, commonGenus: null, genus: null, speciesCommonName: null, speciesName: null });
        }

        await this.clearConfident();
    }

    async updateGenus(genusName: string) {
        const model = this.state.model;
        const genus = this.state.genusData.filter(g => g.genus === genusName);
        if (genus != null && genus.length > 0) {
            model.genus = genus[0].genus;
            await this.setState({ model: model, genus: genus[0] });
            const speciesCount = this.state.speciesData.filter(species => species.genus === model.genus);
            if (speciesCount.length == 1) {
                this.updateCommon(speciesCount[0].commonSpeciesName);
            }
        } else {
            model.genus = null;
            model.species = null;
            await this.setState({ model: model, genus: null, speciesCommonName: null, speciesName: null });
        }
        await this.clearConfident();
    }

    async updateCommon(common: string) {
        const model = this.state.model;
        const species = this.state.speciesData.filter(g => g.commonSpeciesName === common);
        if (species != null && species.length > 0) {
            model.species = species[0].speciesName;
            await this.setState({ model: model, speciesCommonName: species[0] });
            if (species.length == 1) {
                this.updateSpecies(species[0].speciesName);
            }
        } else {
            model.species = null;
            await this.setState({ model: model, speciesCommonName: null, speciesName: null });
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



    async process() {
        if (this.state.isProcessing || !await Confirm(t.__("Etes vous sûr de vouloir modifier ce relevé ?"))) {
            return;
        }
        if (this.props.match.params["statementid"]) {
            await this.setState({ isProcessing: true, errors: [] });
            const result = await ObservationsApi.editStatement(this.state.model, this.props.match.params["observationid"]);
            console.log(result);
            if (!result.success) {
                await this.setState({
                    isProcessing: false,
                    errors: result.errors
                })
            }
            else {
                await this.setState({ isProcessing: false });
                this.props.history.replace({
                    pathname: "/history/" + this.props.match.params["observationid"]
                })
            }
        }
        else {
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
        return (state.commonGenus != null || !StringHelper.isNullOrEmpty(state.model.genus) || state.speciesCommonName != null || !StringHelper.isNullOrEmpty(state.model.species));
    }

    blurField(id) {
        let element = document.getElementById(id);
        if (element != null) {
            element.blur();
        }
    }

    render() {

        const { classes } = this.props;
        const { model, speciesCommonName } = this.state;
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
            genusData = genusData.filter(g => g.commonGenus == this.state.commonGenus?.commonGenus);
        }

        if (model.species && model.species.length > 0 && (model.genus == null || model.genus.length == 0)) {
            let s = this.state.speciesData.filter(g => g.speciesName === model.species).map(s => s.genus);
            genusData = genusData.filter(g => s.indexOf(g.genus) != -1);
        }

        if (speciesCommonName != null) {

            speciesData = speciesData.filter(species => species.commonSpeciesName === speciesCommonName.commonSpeciesName);
        }

        let commonGenus = [...genusData];
        commonGenus = commonGenus.sort((g1, g2) => g1.commonGenus.localeCompare(g2.commonGenus));
        let commonSpecies = [...speciesData];
        commonSpecies = commonSpecies.sort((s1, s2) => s1.commonSpeciesName.localeCompare(s2.commonSpeciesName));

        return (
            <>
                <Box className={clsx(classes.root)}>

                    

                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Genre")}
                    </Typography>
                    {this.state.loaded != null &&
                        <>
                            <FormControl className={clsx(classes.formControl)}>

                                <Autocomplete
                                    id="commonGenusSelect"
                                    options={commonGenus}
                                    getOptionLabel={(option: TreeGenusModel) => option?.commonGenus ?? ""}
                                    renderInput={(params) => <TextField {...params} label="Commun" variant="outlined" />}
                                    getOptionSelected={(o, v) => o.commonGenus == v?.commonGenus}
                                    value={this.state.commonGenus || ""}
                                    onChange={(e, v) => { this.updateCommonGenus((v as any)?.commonGenus); }}
                                    onClose={() => { this.blurField("commonGenusSelect"); }}
                                />

                            </FormControl>

                            <FormControl className={clsx(classes.formControl)}>
                                <Autocomplete
                                    id="genusSelect"
                                    options={genusData.sort((g1, g2) => g1.genus.localeCompare(g2.genus))}
                                    getOptionLabel={(option: TreeGenusModel) => option?.genus ?? ""}
                                    renderInput={(params) => <TextField {...params} label="Latin" variant="outlined" />}
                                    value={this.state.genus || ""}
                                    getOptionSelected={(o, v) => o.genus == v?.genus}
                                    onChange={(e, v) => { this.updateGenus((v as any)?.genus); }}
                                    onClose={() => { this.blurField("genusSelect"); }}
                                />
                            </FormControl>

                            <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                {t.__("Espèce")}
                            </Typography>

                            <FormControl className={clsx(classes.formControl)}>
                                <Autocomplete
                                    id="speciesCommonNameSelect"
                                    options={commonSpecies}
                                    getOptionLabel={(option: SpeciesModel) => option?.commonSpeciesName ?? ""}
                                    renderInput={(params) => <TextField {...params} label="Commune" variant="outlined" />}
                                    onChange={(e, v) => { this.updateCommon((v as any)?.commonSpeciesName); }}
                                    getOptionSelected={(o, v) => o.commonSpeciesName == v?.commonSpeciesName}
                                    value={this.state.speciesCommonName || ""}
                                    onClose={() => { this.blurField("speciesCommonNameSelect"); }}
                                />
                            </FormControl>

                            <FormControl className={clsx(classes.formControl)}>
                                <Autocomplete
                                    id="speciesNameSelect"
                                    options={speciesData.sort((s1, s2) => s1.speciesName.localeCompare(s2.speciesName))}
                                    getOptionLabel={(option: SpeciesModel) => option?.speciesName ?? ""}
                                    renderInput={(params) => <TextField {...params} label="Latine" variant="outlined" />}
                                    onChange={(e, v) => { this.updateSpecies((v as any)?.speciesName); }}
                                    getOptionSelected={(o, v) => o.speciesName == v?.speciesName}
                                    value={this.state.speciesName || ""}
                                    onClose={() => { this.blurField("speciesNameSelect"); }}
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

                            {/*
                                    <RadioGroup value={model.isConfident} onChange={(event) => { this.updateModel("isConfident", event.target.value) }} >
                                        <FormControlLabel value={0} control={<Radio checked={model.isConfident == 0} />} label={t.__("Peu confiant")} className={clsx(classes.label)} />
                                        <FormControlLabel value={1} control={<Radio checked={model.isConfident == 1} />} label={t.__("Moyennement confiant")} className={clsx(classes.label)} />
                                        <FormControlLabel value={2} control={<Radio checked={model.isConfident == 2} />} label={t.__("Confiant")} className={clsx(classes.label)} />
                                    </RadioGroup>
                                */}
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