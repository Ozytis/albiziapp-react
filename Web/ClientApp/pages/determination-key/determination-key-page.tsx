import { Box, createStyles, List, ListItem, ListItemIcon, ListItemText, MenuItem, Select, Tab, Tabs, Theme, WithStyles, withStyles, Popper, Fade, ClickAwayListener } from "@material-ui/core";
import { InfoRounded, ChevronRight, Height } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { FloraKeyModel } from "../../services/generated/flora-key-model";
import { SpeciesModel } from "../../services/generated/species-model";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";
import { filter } from "lodash";
import { keys } from "@material-ui/core/styles/createBreakpoints";

// eslint-disable-next-line
const styles = (theme: Theme) => createStyles({
    root: {

    },
    filter: {
        flexWrap: "wrap"
    },
    select: {
        flexBasis: "100%"
    },
    paper: {
        border: '1px solid',
        padding: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
    },
    tabs: {
        position: "fixed",
        backgroundColor: theme.palette.background.paper,
        height: "4vh",
        width: '100%',
        zIndex:999
    },
    tabList: {
        paddingTop: "48px",
        paddingBottom: "48px",
    }
});

interface DeterminationKeyPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class DeterminationKeyPageState {
    keys: FloraKeyModel[];
    species: SpeciesModel[];
    filters: { [key: string]: string } = {};
    currentTab: "filters" | "results" = "filters";
    currentPopperOpen = "";
    anchorEl: any;

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
        console.log(keys[0].values);
    }

    async updateFilter(keyId: string, value: string) {

        const filters = this.state.filters;
        console.log(filters);
        console.log(keyId);
        console.log(value);
        filters[keyId] = value;
        await this.setState({ filters: filters });
    }

    render() {

        const { classes } = this.props;

        const { keys, species, filters } = this.state;

        let filteredSpecies = species;
        console.log(species);
        for (const filter in filters) {

            const value = filters[filter];
            console.log(filter, value);
            console.log(value.length);
            if (value && value.length > 1) {
                filteredSpecies = filteredSpecies.filter(s => s.floraKeyValues && s.floraKeyValues.some(k => k === value));
            }
        }

        console.log(filters);
        return (
            <Box className={clsx(classes.root)}>

                <Tabs
                    className={clsx(classes.tabs)}
                    value={this.state.currentTab}
                    onChange={(_, val) => this.setState({ currentTab: val })}
                >
                    <Tab value="filters" label={t.__("Critères")} />
                    <Tab value="results" label={t.__("Résultats ({0})", filteredSpecies && filteredSpecies.length)} />
                </Tabs>

                {
                    this.state.currentTab === "filters" && keys &&
                    <List className={clsx(classes.tabList)}>
                        {
                            keys.map(key => {
                                return (
                                    <ListItem key={key.id} className={clsx(classes.filter)}>
                                        <ListItemText
                                            primary={key.frTitle}                                           
                                        />
                                        {(key.frSubTitle != null && key.frSubTitle.length > 0) &&
                                            <>
                                            <ListItemIcon
                                                onClick={(e) => { this.setState({ currentPopperOpen: key.id, anchorEl: e.currentTarget }) }}
                                            >
                                                    <InfoRounded />
                                                

                                            <Popper open={this.state.currentPopperOpen == key.id} anchorEl={this.state.anchorEl} transition >
                                                    {({ TransitionProps }) => (
                                                        <Fade {...TransitionProps} timeout={350}>
                                                            <ClickAwayListener onClickAway={() => { if (this.state.currentPopperOpen == key.id) this.setState({ currentPopperOpen: null, anchorEl: null }) }}  >
                                                                <div className={classes.paper}>{key.frSubTitle}</div>
                                                            </ClickAwayListener>
                                                        </Fade>
                                                    )}
                                                </Popper>
                                            </ListItemIcon>
                                            </>
                                        }
                                        <Select
                                            label={t.__("Choisir")}
                                            value={filters[key.id]}
                                            onChange={e => this.updateFilter(key.id, e.target.value as string)}
                                            className={clsx(classes.select)}
                                        >
                                            <MenuItem key={"non"} value="">
                                                {t.__("Non renseigné")}
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
                    <List className={clsx(classes.tabList)}>
                        {
                            filteredSpecies.map(species => (
                                <ListItem key={species.id}>
                                    <ListItemText
                                        primary={species.speciesName}
                                        secondary={species.commonSpeciesName}
                                        onClick={() => this.props.history.push({ pathname: `species/${species.telaBotanicaTaxon}` })}
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