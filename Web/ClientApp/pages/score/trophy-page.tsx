import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { Theme, WithStyles, createStyles, withStyles, Box, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Typography, CardContent, CardActionArea, CardMedia, Card, Icon } from "@material-ui/core";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { __ } from "../../services/translation";
import { TitleModel } from "../../services/generated/title-model";
import { TrophyModel } from "../../services/generated/trophy-model";
import { UserScoreModel } from "../../services/generated/user-score-model";
import { AuthenticationApi } from "../../services/authentication-service";
import { TrophiesApi } from "../../services/trophies-service";
import { Lock } from "@material-ui/icons";

// eslint-disable-next-line
const styles = (theme: Theme) => createStyles({
    root: {

    },
    card: {
        //color: theme.palette.common.white,
        cursor: "pointer",
    },
    headerItem: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.secondary.contrastText,
        display: "flex",
        "&>span": {
            flex: 1
        },
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
    headerItemSecondary: {
        color: theme.palette.secondary.contrastText,
    },
    slider: {
        position: "relative",
        marginLeft: theme.spacing(0),
        marginRight: theme.spacing(0),
        minHeight: "20vh",
        width: "100%",
        backgroundSize: "contain"
    },
    locked: {
        opacity : '0.2'
    }
});

interface TrophyPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class TrophyPageState {
    score: UserScoreModel;
    trophies: TrophyModel[];
}

class TrophyPageComponent extends BaseComponent<TrophyPageProps, TrophyPageState>{
    constructor(props: TrophyPageProps) {
        super(props, "TrophyPage", new TrophyPageState());
    }

    async componentDidMount() {
        const [trophies, score] = await Promise.all([TrophiesApi.getTrophies(), AuthenticationApi.getUserScore()]);
        console.log(trophies);
        this.setState({ score: score, trophies: trophies });
    }

    trophiesIsUnlocked(trophyId: string) {
        if (this.state.score == null || this.state.score.trophiesId == null) {
            return false;
        }
        return this.state.score.trophiesId.find(t => t == trophyId) != null;
    }

    render() {
        const { classes } = this.props;
        return (
            <Box className={clsx(classes.root)}>


                {this.state.trophies != null && this.state.trophies.map((m) => (

                    <Card className={clsx(classes.root)}>
                        <CardActionArea>


                            <CardMedia
                                className={clsx(classes.slider, !this.trophiesIsUnlocked(m.id) ?  classes.locked : null)}
                                image={`./img/trophy/${m.image}`}
                            >

                            </CardMedia>


                            <CardContent>
                                <Typography gutterBottom variant="h6" component="h2" align="center">
                                    {!this.trophiesIsUnlocked(m.id) &&
                                        <Lock />
                                    }
                                    {__(m.name)}
                                </Typography>

                            </CardContent>
                        </CardActionArea>
                    </Card>
                ))
                }

            </Box>
        )
    }

}

export const TrophyPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(TrophyPageComponent)));