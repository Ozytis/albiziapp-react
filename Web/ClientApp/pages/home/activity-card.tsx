import { Box, Card, CardContent, createStyles, LinearProgress, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { DoneAll, HelpOutline, RadioButtonChecked, Search } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import { ActivitiesApi } from "../../services/activities-service";
import { ActivityModel } from "../../services/generated/activity-model";
import { t } from "../../services/translation-service";

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
    activity: ActivityModel;
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
        switch (this.props.activity.type) {
            case ActivitiesApi.IDENTIFY:
                return HelpOutline;
            case ActivitiesApi.INVENTORY:
                return Search;
            case ActivitiesApi.VERIFY:
                return DoneAll;
            default:
                return RadioButtonChecked;
        }
    }

    render() {

        const { activity, classes, completion, active } = this.props;

        const ActivityIcon = this.getIcon();

        return (
            <Card className={clsx(classes.card, !active && classes.disabledCard)} variant="elevation" raised={active}>
                <CardContent>
                    <Box display="flex" alignItems="center">
                        <Box minWidth={35}>
                            <ActivityIcon />
                        </Box>
                        <Box width="100%" >

                            <Typography variant="caption" component="h2">
                                {t.__(activity.instructions.long)}
                            </Typography>

                            {
                                activity.options && activity.options.length > 0 && activity.options[0] &&
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Box width="100%" mr={1}>
                                        <LinearProgress variant="determinate" value={Math.round(completion * 100 / parseInt(activity.options[0], 10))} />
                                    </Box>
                                    <Box minWidth={35}>
                                        <Typography variant="body2" color={active ? "textSecondary" : "inherit"}>
                                            {completion} / {activity.options[0]}
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