import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import { MissionModel } from "../../services/models/mission-model";
import { MissionsApi } from "../../services/missions-service";
import { ActivityCard } from "./activity-card";
import { AuthenticationApi } from "../../services/authentication-service";
import { MissionUserModel } from "../../services/generated/mission-user-model";
import { MissionsCompleteModel } from "../../services/generated/missions-user-model";

interface ActivitiesTabProps extends RouteComponentProps {

}

class ActivitiesTabState {
    missions: MissionModel[];
    currentMission: MissionModel;
    currentActivityId: string;
    missionProgress: MissionUserModel;
    endMissions: string[];
}

class ActivitiesTabComponent extends BaseComponent<ActivitiesTabProps, ActivitiesTabState>{

    async componentDidMount() {
        await this.refreshMissions();
    }

    async refreshMissions() {
        const missions = await MissionsApi.getMissions();

        var userMissions = await AuthenticationApi.getUserMission(); 
        var endMissions= [];
        var count = 0;
        if (userMissions.missionsComplete != null && userMissions.missionsComplete.length > 0) {
            while (userMissions.missionsComplete[count]) {
                console.log(userMissions.missionsComplete[count]);
                endMissions[count] = userMissions.missionsComplete[count].idMission;
                count= count+1;
            }
        }
        console.log(endMissions);
        await this.setPersistantState({
            currentMission: missions.find(m => m.id == userMissions.missionProgression?.missionId),
            currentActivityId: userMissions.missionProgression?.missionId,
            missionProgress: userMissions,
            endMissions : endMissions
        });

        console.log(this.state.currentMission);
        console.log(this.state.currentActivityId);
        console.log(this.state.missionProgress);
        await this.setState({ missions: missions });
    }

    render() {
        return (
            <>
                {
                    this.state.missions && this.state.missions.map((mission, index) => {

                        /** TODO: récupérer la complétion d'une activité */
                        const completion = this.state.missionProgress?.missionProgression?.progression ?? 0;
                        
                        return (
                            <ActivityCard completion={completion} key={index} mission={mission} active={this.state.currentActivityId == mission.id} onChange={() => this.refreshMissions()} end={this.state.endMissions?.includes(mission.id)} />
                        )
                    })
                }
            </>
        )
    }
}

export const ActivitiesTab = withRouter(ActivitiesTabComponent);