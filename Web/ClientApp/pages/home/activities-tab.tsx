import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { BaseComponent } from "../../components/base-component";
import { MissionModel } from "../../services/generated/mission-model";
import { MissionsApi } from "../../services/missions-service";
import { ActivityCard } from "./activity-card";

interface ActivitiesTabProps extends RouteComponentProps {

}

class ActivitiesTabState {
    missions: MissionModel[];
    currentMission: MissionModel;
    currentActivityIndex = 0;
}

class ActivitiesTabComponent extends BaseComponent<ActivitiesTabProps, ActivitiesTabState>{

    async componentDidMount() {
        await this.refreshMissions();
    }

    async refreshMissions() {
        const missions = await MissionsApi.getMissions();
        console.log(missions)
        /** TODO : récupérer l'activité actuelle */
        await this.setPersistantState({ currentMission: missions[0], currentActivityIndex: 0 });
    }

    render() {
        return (
            <>
                {
                    this.state.currentMission && this.state.currentMission.activities && this.state.currentMission.activities.map((activity, index) => {

                        /** TODO: récupérer la complétion d'une activité */
                        const completion = 0;

                        return (
                            <ActivityCard completion={completion} key={index} activity={activity} active={this.state.currentActivityIndex === index} />
                        )
                    })
                }
            </>
        )
    }
}

export const ActivitiesTab = withRouter(ActivitiesTabComponent);