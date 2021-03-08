import { Box, createStyles, Icon, Tab, Tabs, Theme, WithStyles, withStyles } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { SpeciesInfoModel } from "../../services/generated/species-info-model";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";
import { SpeciesInfoComponent } from "./species-info-component";

const styles = (theme: Theme) => createStyles({

});

interface SpeciesPageProps extends IPropsWithAppContext, RouteComponentProps, WithStyles<typeof styles> {
}

class SpeciesPageState {
    speciesId: string;
}

class SpeciesInfoPageComponent extends BaseComponent<SpeciesPageProps, SpeciesPageState>{
    constructor(props: SpeciesPageProps) {
        super(props, "SpeciesPage", new SpeciesPageState());
    }

    async componentDidMount() {

        const speciesId = this.props.match.params["speciesid"];

        const species = (await SpeciesApi.getAllSpecies()).find(s => s.telaBotanicaTaxon === speciesId);
        console.log(species);
        await this.setState({ speciesId: speciesId });
        if (!species) {
            this.props.appContext.updateContext("title", "Informations non trouvées");
        }
        else {
            this.props.appContext.updateContext("title", species.commonSpeciesName);
        }


    }



    render() {

        const { classes } = this.props;




        return (
            <>
                {this.state.speciesId != null && this.state.speciesId.length > 0 &&
                    <SpeciesInfoComponent speciesId={this.state.speciesId} classes={null} />
                }
            </>
        )
    }

}

export const SpeciesInfoPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(SpeciesInfoPageComponent)));