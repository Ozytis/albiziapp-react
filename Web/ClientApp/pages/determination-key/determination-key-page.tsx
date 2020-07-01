import { Box, createStyles, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, Tab, Tabs, Theme, WithStyles, withStyles } from "@material-ui/core";
import { ChevronRight } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { FloraKeyModel } from "../../services/generated/flora-key-model";
import { SpeciesModel } from "../../services/generated/species-model";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";

// eslint-disable-next-line
const styles = (theme: Theme) => createStyles({
    root: {

    },
    filter: {
        flexWrap: "wrap"
    },
    select: {
        flexBasis: "100%"
    }
});

interface DeterminationKeyPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class DeterminationKeyPageState {
    keys: FloraKeyModel[];
    species: SpeciesModel[];
    filters: { [key: string]: string } = {};
    currentTab: "filters" | "results" = "filters";
}

class DeterminationKeyPageComponent extends BaseComponent<DeterminationKeyPageProps, DeterminationKeyPageState>{
    constructor(props: DeterminationKeyPageProps) {
        super(props, "DeterminationKeyPage", new DeterminationKeyPageState());
    }

    async componentDidMount() {
        const [species, keys] = await Promise.all([
            SpeciesApi.getAllSpecies(),
            SpeciesApi.getAllFloraKeys()
        ]);

        const filters = {};

        keys.forEach(k => {
            filters[k.id] = "";
        });

        await this.setState({
            keys: keys,
            species: species,
            filters: filters
        });
    }

    async updateFilter(keyId: string, value: string) {
        const filters = this.state.filters;
        filters[keyId] = value;
        await this.setState({ filters: filters });
    }

    render() {

        const { classes } = this.props;

        const { keys, species, filters } = this.state;

        let filteredSpecies = species;

        for (const filter in filters) {

            const value = filters[filter];

            if (value && value.length > 1) {
                filteredSpecies = species.filter(s => s.floraKeyValues && s.floraKeyValues.some(k => k === value));
            }
        }

        // console.log("filtered", filteredSpecies);

        return (
            <Box className={clsx(classes.root)}>

                <Tabs
                    value={this.state.currentTab}
                    onChange={(_, val) => this.setState({ currentTab: val })}
                >
                    <Tab value="filters" label={t.__("Critères")} />
                    <Tab value="results" label={t.__("Résultats ({0})", filteredSpecies && filteredSpecies.length)} />
                </Tabs>

                {
                    this.state.currentTab === "filters" && keys &&
                    <List>
                        {
                            keys.map(key => {
                                return (
                                    <ListItem key={key.id} className={clsx(classes.filter)}>
                                        <ListItemText
                                            primary={key.frTitle}
                                            secondary={key.frSubTitle}
                                        />
                                        <Select
                                            label={t.__("Choisir")}
                                            value={filters[key.id]}
                                            onChange={e => this.updateFilter(key.id, e.target.value as string)}
                                            className={clsx(classes.select)}
                                        >
                                            <MenuItem key={"non"} value="">
                                                {t.__("N/R")}
                                            </MenuItem>
                                            {
                                                key.values && key.values.map(value => {

                                                    const enable = filteredSpecies.some(f => f.floraKeyValues && f.floraKeyValues.some(k => k === value.id));

                                                    return (
                                                        <MenuItem key={value.id} value={value.id} disabled={!enable}>
                                                            {t.__(value.normalizedForm)}
                                                        </MenuItem>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                }

                {
                    this.state.currentTab === "results" && filteredSpecies &&
                    <List>
                        {
                            filteredSpecies.map(species=> (
                                <ListItem key={species.id}>
                                    <ListItemText 
                                        primary={species.speciesName} 
                                        secondary={ species.commonSpeciesName} 
                                        onClick={()=> this.props.history.push({ pathname: `species/${species.telaBotanicaTaxon}`})}
                                    />
                                    <ListItemIcon>
                                        <ChevronRight />
                                    </ListItemIcon>
                                </ListItem>
                            ))
                        }
                    </List>
                }
            </Box >
        )
    }
}

export const DeterminationKeyPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(DeterminationKeyPageComponent)));