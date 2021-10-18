import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { Theme, WithStyles, createStyles, withStyles, Box, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";
import { __ } from "../../services/translation";
import { ChevronRight } from "@material-ui/icons";
import { TitlesApi } from "../../services/titles-service";
import { AuthenticationApi } from "../../services/authentication-service";
import { TitleModel } from "../../services/generated/title-model";
import { UserScoreModel } from "../../services/generated/user-score-model";

// eslint-disable-next-line
const styles = (theme: Theme) => createStyles({
    root: {

    },
    card: {
        //color: theme.palette.common.white,
        cursor: "pointer",
    }
});

interface ScorePageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ScorePageState {
    titles: TitleModel[];
    score: UserScoreModel;
}

class ScorePageComponent extends BaseComponent<ScorePageProps, ScorePageState>{
    constructor(props: ScorePageProps) {
        super(props, "ScorePage", new ScorePageState());
    }

    async componentDidMount() {
        const [titles,  userScore] = await Promise.all([TitlesApi.getTitles(), AuthenticationApi.getUserScore()]);
        this.setState({ titles: titles,  score: userScore });


    }

    async goTo(path: string) {
        this.props.history.push({
            pathname: path
        })
    }
    render() {

        const { classes } = this.props;

        return (
            <Box className={clsx(classes.root)}>
                {this.state.titles != null  && this.state.score != null &&
                    <List>

                        <ListItem className={clsx(classes.card)}>
                        <ListItemText primary={__("Points d'exploration")} secondary={this.state.score.explorationPoints} onClick={() => this.goTo(`exploration-points`)} />
                            <ListItemIcon>
                                <ChevronRight />
                            </ListItemIcon>
                        </ListItem>
                        <ListItem className={clsx(classes.card)}>
                        <ListItemText primary={__("Points de connaissance")} secondary={this.state.score.knowledgePoints} onClick={() => this.goTo(`knowledge-points`)} />
                            <ListItemIcon>
                                <ChevronRight />
                            </ListItemIcon>
                        </ListItem>
                    

                        <ListItem className={clsx(classes.card)}>
                        <ListItemText primary={__("Titres")} secondary={`${this.state.score.titlesId != null ? this.state.score.titlesId.length : 0} / ${this.state.titles.length}`} onClick={() => this.goTo(`titles`)}/>
                            <ListItemIcon>
                                <ChevronRight />
                            </ListItemIcon>
                        </ListItem>
                    </List>
                }
            </Box>
        )
    }
}

export const ScorePage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ScorePageComponent)));