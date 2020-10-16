import { Box, Button, createStyles, FormControl, Grid, InputLabel, MenuItem, Select, Switch, Theme, Typography, WithStyles, withStyles, TextField } from "@material-ui/core";
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
import Autocomplete from '@material-ui/lab/Autocomplete';

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
        margin: theme.spacing(1)
    }
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
    commonGenus = "";
    commonName = "";
}

class NewObservationPageComponent extends BaseComponent<NewObservationPageProps, NewObservationPageState>{
    constructor(props: NewObservationPageProps) {
        super(props, "NewObservationPage", new NewObservationPageState());
    }

    async componentDidMount() {
        if (!this.state.model.latitude) {
            this.props.history.push({
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
        const model = this.state.model;
        model[propertyName] = value;
        await this.setState({ model: model });
    }

    async cancelCreation() {
        ObservationsApi.setNextObservationCoordinates(null);
        await this.props.history.push({
            pathname: "/map"
        });
    }

    async updateCommonGenus(commonGenus: string) {
        const model = this.state.model;
        const genus = this.state.genus.find(g => g.commonGenus === commonGenus);
        model.genus = genus.genus;
        var elem = document.getElementById("GenusSelect") as HTMLInputElement;
        elem.value = model.genus;
        console.log(elem.value);
        console.log(elem);
            await this.setState({ model: model, commonGenus: genus.commonGenus });
    }
    async updateGenus(genusName: string) {
        const model = this.state.model;
        const genus = this.state.genus.find(g => g.genus === genusName);
        model.genus = genus.genus;

        await this.setState({ model: model, commonGenus: genus.commonGenus });
    }

    async updateCommonSpecies(commonSpecies: string) {
        const model = this.state.model;
        const species = this.state.species.find(g => g.commonSpeciesName === commonSpecies);
        model.species = species.speciesName;
        
        await this.setState({ model: model, commonName: species.commonSpeciesName });
    }

    async updateSpecies(speciesName: string) {
        const model = this.state.model;
        const species = this.state.species.find(g => g.speciesName === speciesName);
        model.species = species.speciesName;

        await this.setState({ model: model, commonName: species.commonSpeciesName });
    }

    

    async process() {

        if (this.state.isProcessing || !await Confirm(t.__("Etes vous sûr de vouloir valider ce relevé ?"))) {
            return;
        }

        await this.setState({ isProcessing: true, errors: [] });

        const result = await ObservationsApi.createObservation(this.state.model);

        if (!result.success) {
            await this.setState({
                isProcessing: false,
                errors: result.errors
            })
        }
        else {
            await this.setState({ isProcessing: false });

            this.props.history.push({
                pathname: "/map"
            })
        }
    }

    render() {

        const { classes } = this.props;
        const { model } = this.state;
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
        }

        if (model.species && model.species.length > 0 && (model.genus == null || model.genus.length == 0)) {
            let s = this.state.species.filter(g => g.speciesName === model.species).map(s => s.genus);
            genus = genus.filter(g => s.indexOf(g.genus) != -1);
        }

        return (
            <Box className={clsx(classes.root)}>

                <ErrorSummary errors={this.state.errors} />

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                    {t.__("Genre")}
                </Typography>

                <FormControl className={clsx(classes.formControl)} >
                    <Autocomplete
                        id="commonGenusSelect"
                        options={genus.sort((g1, g2) => g1.commonGenus.localeCompare(g2.commonGenus))}
                        getOptionLabel={(option: TreeGenusModel) => option.commonGenus}
                        renderInput={(params) => <TextField {...params} label="Commun" variant="outlined" />}
                        onChange={(e, v) => this.updateCommonGenus((v as any).commonGenus)}
                    />
                </FormControl>

                <FormControl className={clsx(classes.formControl)}>
                    <Autocomplete                        
                        id="GenusSelect"
                        options={genus.sort((g1, g2) => g1.genus.localeCompare(g2.genus))}
                        getOptionLabel={(option: TreeGenusModel) => option.genus}
                        renderInput={(params) => <TextField {...params} label="Latin" variant="outlined" />}
                        onChange={(e, v) => this.updateGenus((v as any).genus)}

                    />
                </FormControl>

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                    {t.__("Espèce")}
                </Typography>

                <FormControl className={clsx(classes.formControl)}>
                    <Autocomplete
                        id="commonSpeciesSelect"
                        options={species.sort((s1, s2) => s1.commonSpeciesName.localeCompare(s2.commonSpeciesName))}
                        getOptionLabel={(option: SpeciesModel) => option.commonSpeciesName}
                        renderInput={(params) => <TextField {...params} label="Commune" variant="outlined" />}                        
                        onChange={(e, v) => this.updateCommonSpecies((v as any).commonSpeciesName)}
                    />
                </FormControl>

                <FormControl className={clsx(classes.formControl)}>
                    <Autocomplete
                        id="SpeciesSelect"
                        options={species.sort((s1, s2) => s1.speciesName.localeCompare(s2.speciesName))}
                        getOptionLabel={(option: SpeciesModel) => option.speciesName}
                        renderInput={(params) => <TextField {...params} label="Latine" variant="outlined" />}                        
                        onChange={(e, v) => this.updateSpecies((v as any).speciesName)}
                    />
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

export const NewObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(NewObservationPageComponent)));