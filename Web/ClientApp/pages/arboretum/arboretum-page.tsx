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
import { t } from "../../services/translation-service";

// eslint-disable-next-line
const styles = (style: Theme) => createStyles({
    root: {
        marginBottom: "15%",
    }
});
const notify = () => toast.success(' Wow so easy!', {
    position: toast.POSITION.BOTTOM_CENTER,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
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
                    <Box>
                    {
                        species && species.length ==0 &&

                        t.__("Il vous faut faire au moins un releve avec un genre")
                        
                    }

                    </Box>
                </Box>
               
            </Box>
        )
    }
}

export const ArboretumPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ArboretumPageComponent)));