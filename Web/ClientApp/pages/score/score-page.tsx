import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { Theme, WithStyles, createStyles, withStyles, Box } from "@material-ui/core";
import { BaseComponent } from "../../components/base-component";
import clsx from "clsx";

const styles = (style: Theme) => createStyles({
    root: {

    }
});

interface ScorePageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ScorePageState {

}

class ScorePageComponent extends BaseComponent<ScorePageProps, ScorePageState>{
    constructor(props: ScorePageProps) {
        super(props, "ScorePage", new ScorePageState());
    }

    render() {

        const { classes } = this.props;

        return (
            <Box className={clsx(classes.root)}>
                Scores
            </Box>
        )
    }
}

export const ScorePage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ScorePageComponent)));