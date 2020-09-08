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
import { TitlesApi } from "../../services/titles-service";

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

    locked: {
        opacity: '0.2'
    }
});

interface TitlePageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class TitlePageState {
    score: UserScoreModel;
    titles: TitleModel[];
}

class TitlePageComponent extends BaseComponent<TitlePageProps, TitlePageState>{
    constructor(props: TitlePageProps) {
        super(props, "TitlePage", new TitlePageState());
    }

    async componentDidMount() {
        const [titles, score] = await Promise.all([TitlesApi.getTitles(), AuthenticationApi.getUserScore()]);

        this.setState({ score: score, titles: titles });
    }

    titlesIsUnlocked(titleId: string) {
        if (this.state.score == null || this.state.score.titlesId == null) {
            return false;
        }
        return this.state.score.titlesId.find(t => t == titleId) != null;
    }

    render() {
        const { classes } = this.props;
        return (
            <Box className={clsx(classes.root)}>

                <List>
                    {this.state.titles != null && this.state.titles.map((m) => (

                        <ListItem className={clsx( !this.titlesIsUnlocked(m.id) ? classes.locked : null)}>
                            <ListItemText primary={__(m.name)} />
                            {!this.titlesIsUnlocked(m.id) &&
                                <ListItemIcon>
                                    <Lock />
                                </ListItemIcon>
                            }
                        </ListItem>
                                       
                ))
                    }
                </List>
            </Box>
        )
    }

}

export const TitlePage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(TitlePageComponent)));