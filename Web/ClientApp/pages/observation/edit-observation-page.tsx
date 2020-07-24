import { Box, Button, createStyles, FormControl, Grid, InputLabel, MenuItem, Select, Switch, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { Undo } from "@material-ui/icons";
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
        margin: theme.spacing(1)
    }
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
    species: SpeciesModel[];
    genus: TreeGenusModel[];
    commonGenus = "";
    commonName = "";
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
        await this.setState({ model: model, commonGenus: model.commonGenus, commonName: model.commonSpeciesName });
       

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

    async cancelCreation() {
        ObservationsApi.setNextObservationCoordinates(null);
        await this.props.history.push({
            pathname: "/observations"
        });
    }

    async updateCommonGenus(commonGenus: string) {
        const model = this.state.model;
        const genus = this.state.genus.find(g => g.commonGenus === commonGenus);
        model.genus = genus.genus;

        await this.setState({ model: model, commonGenus: genus.commonGenus });
    }

    async updateCommon(common: string) {
        const model = this.state.model;
        const species = this.state.species.find(g => g.commonSpeciesName === common);
        model.species = species.speciesName;
        await this.setState({ model: model, commonName: species.commonSpeciesName  });
    }

    async updateSpecies(speciesName: string) {
        const model = this.state.model;
        const species = this.state.species.find(g => g.speciesName === speciesName);
        model.species = species.speciesName;

        await this.setState({ model: model, commonName: species.commonSpeciesName });
    }

    async updateGenus(genusName: string) {
        const model = this.state.model;
        const genus = this.state.genus.find(g => g.genus === genusName);
        model.genus = genus.genus;
        
        await this.setState({ model: model, commonGenus: genus.commonGenus });
    }

    async process() {

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

    render() {

        const { classes } = this.props;
        const { model, genus } = this.state;
        let { species } = this.state;

        if (!species) {
            return (
                <Box className={clsx(classes.root)}>
                    <Loader loading /> {t.__("Chargement...")}
                </Box>
            )
        }

        if (model.genus && model.genus.length > 0) {
            species = species.filter(species => species.genus === model.genus);
        }


        return (
            <Box className={clsx(classes.root)}>

                <ErrorSummary errors={this.state.errors} />

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                    {t.__("Genre")}
                </Typography>

                <FormControl className={clsx(classes.formControl)}>
                    <InputLabel id="commonGenusLabel">{t.__("Commun")}</InputLabel>
                    <Select
                        labelId="commonGenusLabel"
                        id="commonGenusSelect"
                        value={this.state.commonGenus}
                        onChange={(e) => this.updateCommonGenus(e.target.value as string)}
                    >
                        {
                            genus.sort((g1, g2) => g1.commonGenus.localeCompare(g2.commonGenus)).map(genus => {                              
                                return (
                                    <MenuItem value={genus.commonGenus} key={genus.genus}>{t.__(genus.commonGenus)}</MenuItem>
                                )
                            })
                        }

                    </Select>
                </FormControl>

                <FormControl className={clsx(classes.formControl)}>
                    <InputLabel id="genusLabel">{t.__("Latin")}</InputLabel>
                    <Select
                        labelId="genusLabel"
                        id="genusSelect"
                        value={model.genus}
                        onChange={(e) => this.updateGenus(e.target.value as string)}
                    >
                        {
                            genus.sort((g1, g2) => g1.genus.localeCompare(g2.genus)).map(genus => (
                                <MenuItem value={genus.genus} key={genus.genus}>{t.__(genus.genus)}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                    {t.__("Espèce")}
                </Typography>

                <FormControl className={clsx(classes.formControl)}>
                    <InputLabel id="commonLabel">{t.__("Commune")}</InputLabel>
                    <Select
                        labelId="commonLabel"
                        id="commonSelect"
                        value={this.state.commonName}
                        onChange={(e) => this.updateCommon(e.target.value as string)}
                    >
                        {
                            species.sort((s1, s2) => s1.commonSpeciesName.localeCompare(s2.commonSpeciesName)).map(species => (
                                <MenuItem value={species.commonSpeciesName} key={species.speciesName}>
                                    {t.__(species.commonSpeciesName)}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>

                <FormControl className={clsx(classes.formControl)}>
                    <InputLabel id="specieLabel">{t.__("Latine")}</InputLabel>
                    <Select
                        labelId="specieLabel"
                        id="specieSelect"
                        value={model.species}
                        onChange={(e) => this.updateSpecies(e.target.value as string)}
                    >
                        {
                            species.sort((s1, s2) => s1.speciesName.localeCompare(s2.speciesName)).map(species => (
                                <MenuItem value={species.speciesName} key={species.speciesName}>
                                    {t.__(species.speciesName)}
                                </MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>


                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                    {t.__("Confiance")}
                </Typography>

                <Typography component="div">
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>
                            <InputLabel className={clsx(classes.label)}>{t.__("Peu confiant")}</InputLabel>
                        </Grid>
                        <Grid item>
                            <Switch
                                checked={model.isConfident}
                                onChange={(val) => this.updateModel("isConfident", val.target.checked)}
                            />
                        </Grid>
                        <Grid item>
                            <InputLabel className={clsx(classes.label)}>
                                {t.__("Confiant")}
                            </InputLabel>
                        </Grid>
                    </Grid>
                </Typography>

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                    {t.__("Photographie")}
                </Typography>

                <PhotoFormItem label={t.__("Prendre une photo")} value={model.image} onChange={val => this.updateModel("image", val)} />

                <Button color="secondary" variant="contained" fullWidth className={clsx(classes.buttons)} onClick={() => this.process()}>
                    <Loader loading={this.state.isProcessing} usualIcon="check" />
                    {t.__("Valider")}
                </Button>

                <Button color="default" variant="text" className={clsx(classes.buttons)} onClick={() => this.cancelCreation()} fullWidth>
                    <Undo />
                    {t.__("Annuler")}
                </Button>


            </Box>
        )
    }
}

export const EditObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(EditObservationPageComponent)));