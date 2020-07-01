import React from "react";
import { Theme, createStyles, WithStyles, Box, withStyles, Typography, Card, Icon, Tabs, Tab } from "@material-ui/core";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { t } from "../../services/translation-service";
import { SpeciesApi } from "../../services/species-service";
import { SpeciesInfoModel } from "../../services/generated/species-info-model";

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
    slider: {
        position: "relative",
        marginLeft: "auto",
        marginRight: "auto",
        minHeight: "40vh",
        width: "100vw",
    },
    slide: {
        // position: "absolute",
        top: 0,
        width: "100%",
        //height: "100%",
        backgroundColor: "#fff",
        backgroundPosition: "center center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat"
    },
    slideNav: {
        justifyContent: "center",
        display: "flex",
        padding: theme.spacing(1),
        "& > span ": {
            marginRight: theme.spacing(1),
            fontSize: "1rem"
        },
        "& .linkActive": {
            color: theme.palette.secondary.main
        }
    },
    tabs: {
        color: theme.palette.primary.contrastText,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingTop: theme.spacing(1),
    },
    tab: {
        color: theme.palette.primary.contrastText,
    },
    text: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        textAlign: "justify",
        "& p": {
            marginBottom: theme.spacing(1)
        }
    }
});

interface SpeciesPageProps extends IPropsWithAppContext, RouteComponentProps, WithStyles<typeof styles> {

}

class SpeciesPageState {
    info: SpeciesInfoModel;
    currentPictureIndex = 0;
    currentTab: "description" | "usage" | "habitat" = "description";
}

class SpeciesInfoPageComponent extends BaseComponent<SpeciesPageProps, SpeciesPageState>{
    constructor(props: SpeciesPageProps) {
        super(props, "SpeciesPage", new SpeciesPageState());
    }

    async componentDidMount() {

        const speciesId = this.props.match.params["speciesid"];

        const species = (await SpeciesApi.getAllSpecies()).find(s => s.telaBotanicaTaxon === speciesId);

        if (!species) {
            this.props.appContext.updateContext("title", "Informations non trouvées");
        }
        else {
            this.props.appContext.updateContext("title", species.commonSpeciesName);
        }

        const info = await SpeciesApi.getSpeciesInfo(speciesId);

        await this.setState({ info: info });

    }

    endSwipe(e: React.TouchEvent<HTMLElement>): void {

        if (!this.swipeStartLocation || !this.state.info || !this.state.info.pictures || this.state.info.pictures.length < 2) {
            return;
        }

        const touch = e.changedTouches[0];

        const distance = touch.clientX - this.swipeStartLocation.x;
        const absX = Math.abs(distance);

        if (absX > 50) {
            var index = this.state.currentPictureIndex;
            index += distance < 0 ? 1 : -1;

            if (index > 0) {
                index = index % this.state.info.pictures.length;
            }
            else if (index < 0) {
                index = this.state.info.pictures.length + index;
            }

            this.setState({ currentPictureIndex: index });
        }
    }

    startSwipe(e: React.TouchEvent<HTMLElement>): void {
        //e.preventDefault();
        this.swipeStartLocation = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    swipeStartLocation: { x: number, y: number; } = null;

    renderText(text: string) {
        if (!text) {
            return text;
        }

        return text.split("<br>").map(t => "<p>" + t + "</p>").join(" ");
    }

    render() {

        const { classes } = this.props;
        const { info } = this.state;

        if (!info) {
            return (
                <>Chargement</>
            )
        }

        return (
            <>
                <Box className={clsx(classes.root)}>


                    {
                        info.pictures &&
                        <Box className={clsx(classes.slider)} onTouchEnd={(e) => this.endSwipe(e)} onTouchStart={(e) => this.startSwipe(e)}>
                            {
                                info.pictures.map((image, idx) => {

                                    if (idx !== this.state.currentPictureIndex) {
                                        return null;
                                    }

                                    return (
                                        <div key={idx} className={clsx("slide", classes.slide)} style={{/* backgroundImage: `url("${image}")`*/ }}>
                                            <img src={`/pictures?path=${image}`} style={{ width: "100vw", height: "auto", margin: "0 auto" }} />
                                        </div>
                                    )
                                })
                            }

                            {
                                info.pictures && info.pictures.length > 1 &&
                                <div className={clsx(classes.slideNav)}>
                                    {
                                        info.pictures.map((_, index) => {
                                            return (
                                                <Icon key={index} className={clsx("fas fa-circle", { linkActive: index === this.state.currentPictureIndex })} onClick={() => this.setState({ currentPictureIndex: index })} />
                                            )
                                        })
                                    }
                                </div>
                            }
                        </Box>
                    }

                    <Tabs
                        value={this.state.currentTab}
                        onChange={(_, index) => this.setState({ currentTab: index })}
                        className={clsx(classes.tabs)}
                    >
                        <Tab className={clsx(classes.tab)} label={t.__("Description")} value="description" />

                        <Tab className={clsx(classes.tab)} label={t.__("Usage")} value="usage" />
                        <Tab className={clsx(classes.tab)} label={t.__("Habitat")} value="habitat" />
                    </Tabs>


                    {
                        this.state.currentTab === "description" &&

                        <div dangerouslySetInnerHTML={{ __html: this.renderText(info.description) }} className={clsx(classes.text)} />
                    }

                    {
                        this.state.currentTab === "usage" &&
                        <div dangerouslySetInnerHTML={{ __html: this.renderText(info.usage) }} className={clsx(classes.text)} />
                    }

                    {
                        this.state.currentTab === "habitat" &&
                        <div dangerouslySetInnerHTML={{ __html: this.renderText(info.habitat) }} className={clsx(classes.text)} />
                    }

                </Box>
            </>
        )
    }

}

export const SpeciesInfoPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(SpeciesInfoPageComponent)));