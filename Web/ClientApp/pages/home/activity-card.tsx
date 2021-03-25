import { Box, Card, CardContent, createStyles, LinearProgress, Theme, Typography, WithStyles, withStyles, Button } from "@material-ui/core";
import { DoneAll, HelpOutline, RadioButtonChecked, Search, Watch, WatchLaterTwoTone, StopOutlined, Cancel, Check } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import { t } from "../../services/translation-service";
import { MissionModel, IdentificationMissionModel, NewObservationMissionModel, NumberOfActions } from "../../services/models/mission-model";
import { MissionProgressionModel } from "../../services/generated/mission-progression-model";
import { MissionsApi } from "../../services/missions-service";
import { Confirm } from "../../components/confirm";
import { MissionProgressionCreationModel } from "../../services/generated/mission-progression-creation-model";

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
    end?: boolean;
    onChange?: () => Promise<any>;

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
    async startMission(missionId: string) {
        if (missionId != null ) {
            if (!await Confirm(t.__("Etes vous sûr de vouloir commencer cette mission? Cela arrêtera les missions déjà commencé."))) {
                return;
            }
        }
        else if (missionId == null) {
            if (!await Confirm(t.__("Etes vous sûr de vouloir arrêter cette mission?"))) {
                return;
            }
        }
        const model = new MissionProgressionCreationModel();
            model.missionId = missionId;
        
        await MissionsApi.startMission(model);
        this.props.onChange();
    }

    render() {

        const { mission, classes, completion, active, end} = this.props;
        const ActivityIcon = this.getIcon();
        // console.log(activity);
        return (
            <Card className={clsx(classes.card, end && classes.disabledCard)} variant="elevation" raised={!end}>
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
                                !active && mission.endingCondition && mission.endingCondition instanceof NumberOfActions && mission.endingCondition.number != null &&
                                <Box display="flex" alignItems="center" mt={1}>
                                    <Box width="100%" mr={1}>
                                        <LinearProgress variant="determinate" value={Math.round(completion * 100 / mission.endingCondition.number)} />
                                    </Box>
                                    <Box minWidth={35}>
                                        <Typography variant="body2" color={!active ? "textSecondary" : "inherit"}>
                                            {completion} / {mission.endingCondition.number}
                                        </Typography>
                                    </Box>
                                </Box>
                            }
                        </Box>
                        { mission && !active && !end &&
                            <Box>
                            <Button color="primary" variant="contained" onClick={() => this.startMission(mission.id)} style={{maxWidth:"80%", fontSize:"9px"}}>
                                <WatchLaterTwoTone className="mr-2" style={{ width: "15px" }} />
                                {t.__("Commencer")}
                            </Button>
                            </Box>
                        }
                        {mission && active && !end &&
                            <Box>
                            <Button color="secondary" variant="contained" onClick={() => this.startMission(null)} style={{ maxWidth: "80%", fontSize: "9px" }}>
                                <Cancel className="mr-2" style={{ width:"15px" }} />
                                {t.__("Abandonner")}
                            </Button>
                            </Box>
                        }
                        {end &&
                            <Box>
                                <Check className="mr-2" style={{ width: "50px" }} />
                            </Box>
                        }
                    </Box>
                </CardContent>
            </Card>
        )
    }
}

export const ActivityCard = withStyles(styles, { withTheme: true })(withRouter(ActivityCardComponent));