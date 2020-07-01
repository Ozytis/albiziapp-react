import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { Theme, WithStyles, createStyles, withStyles, Box } from "@material-ui/core";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { ObservationsApi } from "../../services/observation";
import { AuthenticationApi } from "../../services/authentication-service";
import { ArboretumCard } from "./arboretum-card";
import { SpeciesModel } from "../../services/generated/species-model";

const styles = (style: Theme) => createStyles({
    root: {

    }
});

interface ArboretumPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ArboretumPageState {
    species: { species: SpeciesModel; nbOfViews: number }[];
}

class ArboretumPageComponent extends BaseComponent<ArboretumPageProps, ArboretumPageState>{
    constructor(props: ArboretumPageProps) {
        super(props, "ArboretumPage", new ArboretumPageState());
    }

    async componentDidMount() {

        const species = await ObservationsApi.getUserArboretum(AuthenticationApi.user.osmId);
        await this.setState({ species: species });
    }

    render() {

        const { classes } = this.props;

        return (
            <Box className={clsx(classes.root)}>
                {
                    this.state.species && this.state.species.map(arboretum => {
                        return (
                            <ArboretumCard key={arboretum.species.telaBotanicaTaxon} species={arboretum.species} nbOfViews={arboretum.nbOfViews} />
                        )
                    })
                }
            </Box>
        )
    }
}

export const ArboretumPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ArboretumPageComponent)));