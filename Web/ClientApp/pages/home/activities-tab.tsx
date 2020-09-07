import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import { MissionModel } from "../../services/generated/mission-model";
import { MissionsApi } from "../../services/missions-service";
import { ActivityCard } from "./activity-card";
import { AuthenticationApi } from "../../services/authentication-service";
import { MissionUserModel } from "../../services/generated/mission-user-model";

interface ActivitiesTabProps extends RouteComponentProps {

}

class ActivitiesTabState {
    missions: MissionModel[];
    currentMission: MissionModel;
    currentActivityId: string;
    missionProgress: MissionUserModel;
}

class ActivitiesTabComponent extends BaseComponent<ActivitiesTabProps, ActivitiesTabState>{

    async componentDidMount() {
        await this.refreshMissions();
    }

    async refreshMissions() {
        const missions = await MissionsApi.getMissions();
        var userMissions = await AuthenticationApi.getUserMission();    
        await this.setPersistantState({
            currentMission: missions.find(m => m.id == userMissions.missionProgression.missionId),
            currentActivityId: userMissions.missionProgression.activityId,
            missionProgress: userMissions
        });
    }

    render() {
        return (
            <>
                {
                    this.state.currentMission && this.state.currentMission.activities && this.state.currentMission.activities.map((activity, index) => {

                        /** TODO: récupérer la complétion d'une activité */
                        const completion = this.state.missionProgress.missionProgression.progression ?? 0;
                        
                        return (
                            <ActivityCard completion={completion} key={index} activity={activity} active={this.state.currentActivityId == activity.id} />
                        )
                    })
                }
            </>
        )
    }
}

export const ActivitiesTab = withRouter(ActivitiesTabComponent);