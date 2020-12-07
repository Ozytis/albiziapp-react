import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, createStyles, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import { SpeciesInfoModel } from "../../services/generated/species-info-model";
import { SpeciesModel } from "../../services/generated/species-model";
import { SpeciesApi } from "../../services/species-service";
import { t } from "../../services/translation-service";


const style = (theme: Theme) => createStyles({
    root: {
        margin: theme.spacing(1)
    },
    slider: {
        position: "relative",
        marginLeft: theme.spacing(0),
        marginRight: theme.spacing(0),
        minHeight: "30vh",
        width: "100%",
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
    }
});

interface ArboretumCardProps extends WithStyles<typeof style>, RouteComponentProps {
    species: SpeciesModel;
    nbOfViews: number;
}

class ArboretumCardState {
    speciesInfo: SpeciesInfoModel;
    currentPictureIndex = 0;
}

class ArboretumCardComponent extends BaseComponent<ArboretumCardProps, ArboretumCardState>{
    constructor(props: ArboretumCardProps) {
        super(props, "ArboretumCard-" + props.species.telaBotanicaTaxon, new ArboretumCardState());
    }

    async componentDidMount() {
        const info = await SpeciesApi.getSpeciesInfo(this.props.species.telaBotanicaTaxon);

        await this.setState({
            speciesInfo: info
        });
        console.log(info);
    }

    endSwipe(e: React.TouchEvent<HTMLElement>): void {

        if (!this.swipeStartLocation || !this.state.speciesInfo || !this.state.speciesInfo.pictures || this.state.speciesInfo.pictures.length < 2) {
            return;
        }

        const touch = e.changedTouches[0];

        const distance = touch.clientX - this.swipeStartLocation.x;
        const absX = Math.abs(distance);

        if (absX > 50) {
            let index = this.state.currentPictureIndex;
            index += distance < 0 ? 1 : -1;

            if (index > 0) {
                index = index % this.state.speciesInfo.pictures.length;
            }
            else if (index < 0) {
                index = this.state.speciesInfo.pictures.length + index;
            }

            this.setState({ currentPictureIndex: index });
        }
    }

    startSwipe(e: React.TouchEvent<HTMLElement>): void {
        //e.preventDefault();
        this.swipeStartLocation = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    swipeStartLocation: { x: number; y: number } = null;

    render() {

        if (!this.state.speciesInfo) {
            return null;
        }

        const info = this.state.speciesInfo;

        if (!info) {
            return null;
        }

        const { classes } = this.props;

        return (
            <Card className={clsx(classes.root)}>
                <CardActionArea>

                    {
                        info && info.pictures &&
                        <CardMedia
                            className={clsx(classes.slider)}
                            onTouchEnd={(e) => this.endSwipe(e)} onTouchStart={(e) => this.startSwipe(e)}
                            image={`/pictures?path=${encodeURIComponent(info.pictures[this.state.currentPictureIndex])}`}
                        >

                        </CardMedia>
                    }

                    <CardContent>
                        <Typography gutterBottom variant="h6" component="h2">
                            {this.props.species.speciesName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            {t.__("Nombre d'identifications :")} {this.props.nbOfViews}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button size="small" color="primary"
                        component={"a"}
                        onClick={() => this.props.history.push({ pathname: `species/${this.props.species.telaBotanicaTaxon}` })}>
                        {t.__("En savoir plus")}
                    </Button>
                </CardActions>
            </Card>
        )
    }
}

export const ArboretumCard = withStyles(style, { withTheme: true })(withRouter(ArboretumCardComponent));