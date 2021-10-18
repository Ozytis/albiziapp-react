import { Box, createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { AuthenticationApi } from "../../services/authentication-service";
import { SpeciesModel } from "../../services/generated/species-model";
import { ObservationsApi } from "../../services/observation";
import { ArboretumCard } from "./arboretum-card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

// eslint-disable-next-line
const styles = (style: Theme) => createStyles({
    root: {
        marginBottom: "15%",
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
        const { species } = this.state;


        return (
            <Box>
                <div>
                    {
                        species && species.length == 0 &&
                        <p className="m-auto" style={{ width: "fit-content" }}>Il vous faut faire au moins un releve avec un genre</p>
                    }

                </div>

                <Box>
                    <ToastContainer
                        position="bottom-center"
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </Box>
                <Box className={clsx(classes.root)}>
                    {
                        species && species.map(arboretum => {
                            return (arboretum.species != null ?
                                <ArboretumCard key={arboretum.species.id} species={arboretum.species} nbOfViews={arboretum.nbOfViews} /> : <></>
                            )
                        })
                    }
                </Box>

            </Box>
        )
    }
}

export const ArboretumPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ArboretumPageComponent)));