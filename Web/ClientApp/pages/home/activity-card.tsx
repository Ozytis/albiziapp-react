import { Box, Card, CardContent, createStyles, LinearProgress, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { DoneAll, HelpOutline, RadioButtonChecked, Search } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import { ActivitiesApi } from "../../services/activities-service";

import { t } from "../../services/translation-service";
import { MissionModel, IdentificationMissionModel, NewObservationMissionModel, NumberOfActions } from "../../services/models/mission-model";

const styles = (theme: Theme) => createStyles({
    card: {
        marginBottom: "2vh"
    },
    disabledCard: {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.text.disabled
    }
});

interface ActivityCardProps extends WithStyles<typeof styles>, RouteComponentProps {
    mission: MissionModel;
    completion: number;
    active: boolean;
}

class ActivityCardState {

}

class ActivityCardComponent extends BaseComponent<ActivityCardProps, ActivityCardState>{
    constructor(props: ActivityCardProps) {
        super(props, "activity", new ActivityCardState())
    }

    getIcon() {

        if (this.props.mission instanceof IdentificationMissionModel) {
            return HelpOutline;
        } else if (this.props.mission instanceof NewObservationMissionModel) {
            return Search;
        } else if (this.props.mission instanceof NewObservationMissionModel) {
            return DoneAll;
        } else {
            return RadioButtonChecked;
        }

    }

    render() {

        const { mission, classes, completion, active } = this.props;

        const ActivityIcon = this.getIcon();
        // console.log(activity);
        return (
            <Card className={clsx(classes.card, !active && classes.disabledCard)} variant="elevation" raised={active}>
                <CardContent>
                    <Box display="flex" alignItems="center">
                        <Box minWidth={35}>
                            <ActivityIcon />
                        </Box>
                        <Box width="100%" >

                            <Typography variant="caption" component="h2">
                                {t.__(mission.description)}
                            </Typography>

                            {
                                active && mission.endingCondition && mission.endingCondition instanceof NumberOfActions && mission.endingCondition.number != null &&
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Box width="100%" mr={1}>
                                        <LinearProgress variant="determinate" value={Math.round(completion * 100 / mission.endingCondition.number)} />
                                    </Box>
                                    <Box minWidth={35}>
                                        <Typography variant="body2" color={active ? "textSecondary" : "inherit"}>
                                            {completion} / {mission.endingCondition.number}
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        )
    }
}

export const ActivityCard = withStyles(styles, { withTheme: true })(withRouter(ActivityCardComponent));