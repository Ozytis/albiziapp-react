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

interface KnowledgePointsPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class KnowledgePointsPageState {
    score: UserScoreModel;
}

class KnowledgePointsPageComponent extends BaseComponent<KnowledgePointsPageProps, KnowledgePointsPageState>{
    constructor(props: KnowledgePointsPageProps) {
        super(props, "ExplorationPointPage", new KnowledgePointsPageState());
    }


    async componentDidMount() {
        var score = await AuthenticationApi.getUserScore()
        this.setState({ score: score });
    }


    getName(type: number) {
        switch (type) {
            case 1: return __("Déclarer un arbre douteux");
            case 2: return __("Utiliser Folia");
            case 3: return __("Validation d'un de vos relevés avec le même genre");
            case 4: return __("Validation d'un de vos relevés avec le même espèce");
            case 5: return __("Validation d'un de vos relevés avec le même nom commun");
            case 6: return __("Genre correctement identifié");
            case 7: return __("Espèce correctement identifié");
            case 8: return __("Nom commun correctement identifié");
            case 9: return __("Modifier le champ 'genre' d'un relevé");
            case 10: return __("Modifier le champ 'espèce' d'un relevé");
            case 11: return __("Modifier le champ 'nom commun' d'un relevé");
            case 12: return __("Valider un relevé");
            case 13: return __("Confiant sur le relevé");
        }
    }


    render() {
        const { classes } = this.props;
        return (
            <Box className={clsx(classes.root)}>
                <List>
                    <ListItem className={clsx(classes.headerItem)}>
                        <ListItemText primary={__("Points de connaissance acquis")} />
                        {this.state.score != null &&
                            <ListItemSecondaryAction className={clsx(classes.headerItemSecondary)}>
                                <ListItemText primary={this.state.score.knowledgePoints} />
                            </ListItemSecondaryAction>
                        }
                    </ListItem>
                </List>
                <List>
                    <ListItem className={clsx(classes.headerItem)}>
                        <ListItemText primary={__("Points acquis")} />

                    </ListItem>
                    {this.state.score != null && this.state.score.knowledgePointsHistory != null && this.state.score.knowledgePointsHistory.map(h => (
                        <ListItem >
                            <ListItemText primary={this.getName(h.type)} />
                            <ListItemSecondaryAction>
                                <ListItemText primary={h.point} />
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}

                </List>
                <List>
                    <ListItem className={clsx(classes.headerItem)}>
                        <ListItemText primary={__("Comment obtenir des points?")} />

                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Déclarer un arbre douteux")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={1} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Utiliser Folia")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={2} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Validation d'un de vos relevés avec le même genre")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={2} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Validation d'un de vos relevés avec le même espèce")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={4} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Validation d'un de vos relevés avec le même nom commun")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={4} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={__("Genre correctement identifié")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={10} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Espèce correctement identifié")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={10} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Nom commun correctement identifié")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={15} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Modifier le champ 'genre' d'un relevé")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={0} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Modifier le champ 'espèce' d'un relevé")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={0} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Modifier le champ 'nom commun' d'un relevé")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={0} />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem >
                        <ListItemText primary={__("Valider un relevé")} />
                        <ListItemSecondaryAction>
                            <ListItemText primary={0} />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Box>
        )
    }

}

export const KnowledgePointsPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(KnowledgePointsPageComponent)));