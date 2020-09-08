import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { Theme, WithStyles, createStyles, withStyles, Box, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { __ } from "../../services/translation";
import { TitleModel } from "../../services/generated/title-model";
import { TrophyModel } from "../../services/generated/trophy-model";
import { UserScoreModel } from "../../services/generated/user-score-model";
import { AuthenticationApi } from "../../services/authentication-service";

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
    }
});

interface ExplorationPointsPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ExplorationPointsPageState {
    score: UserScoreModel;
}

class ExplorationPointsPageComponent extends BaseComponent<ExplorationPointsPageProps, ExplorationPointsPageState>{
    constructor(props: ExplorationPointsPageProps) {
        super(props, "ExplorationPointPage", new ExplorationPointsPageState());
    }

    async componentDidMount() {
        var score = await AuthenticationApi.getUserScore()
        this.setState({ score: score });
    }

    render() {
        const { classes } = this.props;
        return (
            <Box className={clsx(classes.root)}>
                <List>
                    <ListItem className={clsx(classes.headerItem)}>
                        <ListItemText primary={__("Points d'exploration acquis")} />
                        {this.state.score != null &&
                            <ListItemSecondaryAction className={clsx(classes.headerItemSecondary)}>
                                <ListItemText primary={this.state.score.explorationPoints} />
                            </ListItemSecondaryAction>
                        }
                    </ListItem>
                </List>
                {/* todo list des points acquis */}
                <List>
                    <ListItem className={clsx(classes.headerItem)}>
                        <ListItemText primary={__("Comment obtenir des points?")} />
                        
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Faire un relevé")}/>
                        <ListItemSecondaryAction>
                            <ListItemText primary={1} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Photographier un arbre")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={2} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Completer le champ 'genre' d'un relevé")}  />
                        <ListItemSecondaryAction>
                            <ListItemText primary={3} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Completer le champ 'espèce' d'un relevé")}  />
                        <ListItemSecondaryAction>
                            <ListItemText primary={6} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Completer le champ 'nom commun' d'un relevé")}  />
                        <ListItemSecondaryAction>
                            <ListItemText primary={6} />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Box>
        )
    }

}

export const ExplorationPointsPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ExplorationPointsPageComponent)));