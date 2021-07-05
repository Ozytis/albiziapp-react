import { Container, createStyles, Theme, WithStyles, withStyles, Box, Typography, FormControl, Button, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { FoliaRequestModel } from "../../services/generated/folia-request-model";
import { PhotoFormItem } from "../../components/photo-form-item";
import { t } from "../../services/translation-service";
import { Loader } from "../../components/loader";
import { StringHelper } from "../../utils/string-helper";
import { Confirm } from "../../components/confirm";
import { FoliaApi } from "../../services/folia-service";
import { ErrorSummary } from "../../components/error-summary";
import { FoliaResultModel } from "../../services/generated/folia-result-model";
import { ChevronRight } from "@material-ui/icons";

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
    tabs: {
        maxWidth: "1000vw",
        marginBottom: "1vh"
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
    titleBox: {
        color: theme.palette.common.black,
        marginLeft: theme.spacing(2),
    },
    card: {
        cursor: "pointer",
        color: theme.palette.common.black
    }
});

interface FoliaPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {
}

class FoliaPageState {
    constructor() {
        this.model = new FoliaRequestModel();
    }
    model: FoliaRequestModel;
    flowerOrFruitImage: string[];
    leaf: string[];
    bark: string[];
    isProcessing: boolean;
    errors: string[];
    result: FoliaResultModel[];
}

class FoliaPageComponent extends BaseComponent<FoliaPageProps, FoliaPageState>{
    constructor(props: FoliaPageProps) {
        super(props, " FoliaPage", new FoliaPageState());
  
    }

    componentDidMount() {
        console.log("CDM");
        var foliaResult = localStorage.getItem("foliaResult");
        if (foliaResult != null) {
            var foliaParsed = JSON.parse(foliaResult);
            this.setState({ result: foliaParsed });
        }
    }

    async addflowerOrFruitImagePicture(value: any) {
        var flowerOrFruitImage = this.state.flowerOrFruitImage;
        if (flowerOrFruitImage == null) {
            flowerOrFruitImage = [];
        }
        flowerOrFruitImage.push(value);
        var model = this.state.model;
        model.flowerOrFruitImage = value;
        await this.setState({ flowerOrFruitImage: flowerOrFruitImage, model: model });
    }
    async deleteflowerOrFruitImage(index: any) {
        var flowerOrFruitImage = this.state.flowerOrFruitImage;
        if (flowerOrFruitImage == null) {
            return;
        }
        flowerOrFruitImage = null;
        var model = this.state.model;
        model.flowerOrFruitImage = null;
        await this.setState({ flowerOrFruitImage: flowerOrFruitImage, model: model });
    }

    async addLeafPicture(value: any) {
        var leaf = this.state.leaf;
        if (leaf == null) {
            leaf = [];
        }
        leaf.push(value);
        var model = this.state.model;
        model.leafPath = value;
        await this.setState({ leaf: leaf, model: model });
    }
    async deleteLeafImage(index: any) {
        var leaf = this.state.leaf;
        if (leaf == null) {
            return;
        }
        leaf.splice(index, 1);
        var model = this.state.model;
        model.leafPath = null;
        await this.setState({ leaf: leaf, model: model });
    }

    async addBarkPicture(value: any) {
        var bark = this.state.bark;
        if (bark == null) {
            bark = [];
        }
        bark.push(value);
        var model = this.state.model;
        model.barkPath = value;
        await this.setState({ bark: bark, model: model });
    }
    async deleteBarkImage(index: any) {
        var bark = this.state.bark;
        if (bark == null) {
            return;
        }
        bark.splice(index, 1);
        var model = this.state.model;
        model.barkPath = null;
        await this.setState({ bark: bark, model: model });
    }

    async process() {
        if (this.state.isProcessing) {
            return;
        }
        if (StringHelper.isNullOrEmpty(this.state.model.barkPath) && StringHelper.isNullOrEmpty(this.state.model.leafPath) && StringHelper.isNullOrEmpty(this.state.model.flowerOrFruitImage)) {
            alert(t.__("Veuillez choisir au moins une photo"));
            return;
        }

        await this.setState({ isProcessing: true });

        var result = await FoliaApi.requestFolia(this.state.model);

        if (!result.success) {
            await this.setState({
                isProcessing: false,
                errors: result.errors,
                result: result.data
            })
        }
        else {
            await this.setState({ isProcessing: false, result: result.data });
            localStorage.setItem("foliaResult", JSON.stringify(  result.data ));
        }
    }

    async reset() {
        await this.setState({ result: null, flowerOrFruitImage: null, leaf: null, bark: null, model: new FoliaRequestModel });
        localStorage.setItem("foliaResult", null);
    }

    getHumanSpeciesText(src: string) {
        var rex = /([A-Z])([A-Z])([a-z])|([a-z])([A-Z])/g;

        return src.replace(rex, '$1$4 $2$3$5');
    }

    clickOnSpecies(speciedId: string) {
        if (!StringHelper.isNullOrEmpty(speciedId)) {
            this.goTo(`species/${speciedId}`);
        }
    }

    async goTo(path: string) {
        this.props.history.push({
            pathname: path
        })
    }

    render() {
        const { classes } = this.props;

        return (
            <>
                <Box className={clsx(classes.root)} >
                    {this.state.errors &&
                        <ErrorSummary errors={this.state.errors} />
                    }

                    <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                        {t.__("Reconnaisssance avec Folia")}
                    </Typography>

                    {this.state.result == null &&
                        <>
                            <Box className={clsx(classes.titleBox)}>
                                Veuillez prendre au moins une photo
                    </Box>
                            <FormControl className={clsx(classes.formControl)}>
                                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                    {t.__("Fleur ou fruit")}
                                </Typography>
                                <PhotoFormItem label={t.__("")} maxPhoto={1} value={this.state.flowerOrFruitImage} onAdd={val => this.addflowerOrFruitImagePicture(val)} onDelete={index => this.deleteflowerOrFruitImage(index)} />

                            </FormControl>

                            <FormControl className={clsx(classes.formControl)}>
                                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                    {t.__("Feuille")}
                                </Typography>
                                <PhotoFormItem label={t.__("")} maxPhoto={1} value={this.state.leaf} onAdd={val => this.addLeafPicture(val)} onDelete={index => this.deleteLeafImage(index)} />

                            </FormControl>

                            <FormControl className={clsx(classes.formControl)}>
                                <Typography variant="h6" className={clsx(classes.sectionHeading)}>
                                    {t.__("Écorse")}
                                </Typography>
                                <PhotoFormItem label={t.__("")} maxPhoto={1} value={this.state.bark} onAdd={val => this.addBarkPicture(val)} onDelete={index => this.deleteBarkImage(index)} />

                            </FormControl>

                            <Button color="primary" variant="contained" fullWidth className={clsx(classes.buttons)} onClick={() => this.process()}>
                                <Loader loading={this.state.isProcessing} usualIcon="check" />
                                {t.__("Valider")}
                            </Button>
                        </>
                    }

                    {this.state.result != null &&
                        <>
                            {this.state.result.map((fr, i) => {
                                return (
                                    <ListItem key={fr.species} className={clsx(classes.card)}>
                                        <ListItemText primary={this.getHumanSpeciesText(fr.species)} onClick={() => this.clickOnSpecies(fr.speciesId)} secondary={Math.round(((fr.probability * 100) * 100) / 100) + " %"} />
                                        {fr.speciesId != null &&
                                            <ListItemIcon>
                                                <ChevronRight />
                                            </ListItemIcon>
                                        }
                                    </ListItem>
                                )
                            })
                        }
                        <Button color="primary" variant="contained" fullWidth className={clsx(classes.buttons)} onClick={() => this.reset()}>
                            <Loader loading={false} usualIcon="check" />
                            {t.__("Nouvelle recherche")}
                        </Button>
                        </>
                    }
                </Box>
            </>
        );
    }
}

export const FoliaPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(FoliaPageComponent)));