import { Box, createStyles, List, ListItem, ListItemIcon, ListItemText, ListSubheader, TextField, Theme, WithStyles, withStyles } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { SpeciesModel } from "../../services/generated/species-model";
import { TreeGenusModel } from "../../services/models/tree-species";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";
import { StringHelper } from "../../utils/string-helper";

const styles = (theme: Theme) => createStyles({
    root: {
        backgroundColor: theme.palette.primary.main,
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: 0,
        color: theme.palette.common.white
    },
    sectionHeading: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    genusItem: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.secondary.contrastText,
        display: "flex",
        "&>span": {
            flex: 1
        },
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    genusRightItem: {
        textAlign: "right"
    },
    specyItem: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    searchWrapper: {
        color: theme.palette.primary.contrastText,
        padding: theme.spacing(1),
    },
    searchInput: {
        color: theme.palette.primary.contrastText,
        "& input": {
            color: theme.palette.primary.contrastText,
        }
    }
});

interface SpeciesPageProps extends IPropsWithAppContext, RouteComponentProps, WithStyles<typeof styles> {

}

class SpeciesPageState {
    species: SpeciesModel[];
    genus: TreeGenusModel[];
    speciesFiltered: SpeciesModel[];
    genusFiltered: TreeGenusModel[];
    speciesFilter: string ;
}

class SpeciesPageComponent extends BaseComponent<SpeciesPageProps, SpeciesPageState>{

    filterTimeout: any;

    constructor(props: SpeciesPageProps) {
        super(props, "SpeciesPage", new SpeciesPageState());
    }

    async componentDidMount() {
        this.refreshSpecies();

    }

    async refreshSpecies() {

        const species = (await SpeciesApi.getAllSpecies())
            .filter(s => s.telaBotanicaTaxon && s.telaBotanicaTaxon.length > 0)
            .sort((s1, s2) => s1.speciesName.localeCompare(s2.speciesName));

        const genus = species
            .map(s => { return { genus: s.genus, commonGenus: s.commonGenus } as TreeGenusModel })
            .filter((genus, index, self) => self.findIndex(g => g.genus === genus.genus) === index)
            .sort((g1, g2) => g1.commonGenus.localeCompare(g2.commonGenus));

        await this.setState({ species: species, genus: genus });
       await this.filter();
    }

    async goTo(route: string) {
        this.props.history.push({
            pathname: route
        });
    }

    updateFilter(filter: string) {

        this.setState({ speciesFilter: filter });
        if (this.filterTimeout) {
            clearTimeout(this.filterTimeout);
        }
        this.filterTimeout = setTimeout(() => this.filter(), 300);
    }

   async  filter() {
        let speciesFiltered = this.state.species;

       if (this.state.speciesFilter && speciesFiltered) {
           var filter = StringHelper.removeDiacritics( this.state.speciesFilter.toUpperCase());
           speciesFiltered = speciesFiltered.filter(specie => StringHelper.removeDiacritics(specie.speciesName.toUpperCase()).includes(filter) || StringHelper.removeDiacritics(specie.commonSpeciesName.toUpperCase()).includes(filter));
        }

        let genusFiltered = this.state.genus;
        if (genusFiltered) {
            genusFiltered = genusFiltered.filter(g => speciesFiltered.filter(s => s.genus === g.genus).length > 0);
        }
        await this.setState({ genusFiltered: genusFiltered, speciesFiltered: speciesFiltered })
    }

    render() {

        const { classes } = this.props;
        const { speciesFiltered, genusFiltered } = this.state;

        return (
            <>
                <Box className={clsx(classes.root)}>
                    <div className={clsx(classes.searchWrapper)}>
                        <TextField
                            type="search" fullWidth placeholder={t.__("Rechercher")}
                            className={clsx(classes.searchInput)}
                            value={this.state.speciesFilter ?? ""}
                            onChange={(e) => this.updateFilter(e.target.value)}
                        />
                    </div>

                    {
                        speciesFiltered &&
                        <List >
                            {
                                genusFiltered.map(genus => {
                                    return (
                                        <React.Fragment key={genus.genus}>
                                            <ListSubheader disableGutters>
                                                <div className={clsx(classes.genusItem)}>
                                                    <span>{genus.commonGenus}</span>
                                                    <span className={clsx(classes.genusRightItem)}>{genus.genus}</span>
                                                </div>
                                            </ListSubheader>
                                            {
                                                speciesFiltered.filter(s => s.genus === genus.genus).map(specy => {
                                                    return (
                                                        <ListItem
                                                            key={specy.telaBotanicaTaxon}
                                                            disableGutters
                                                            className={clsx(classes.specyItem)}
                                                            button
                                                            onClick={() => this.goTo(`species/${specy.telaBotanicaTaxon}`)}
                                                        >
                                                            <ListItemText primary={specy.speciesName} secondary={specy.commonSpeciesName} />
                                                            <ListItemIcon>
                                                                <ChevronRight />
                                                            </ListItemIcon>
                                                        </ListItem>
                                                    )
                                                })
                                            }
                                        </React.Fragment>
                                    )
                                })
                            }
                        </List>
                    }
                </Box>
            </>
        )
    }
}

export const SpeciesPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(SpeciesPageComponent)));