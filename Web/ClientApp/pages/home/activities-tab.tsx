import React from "react";
import { BaseComponent } from "../../components/base-component";
import { withRouter, RouteComponentProps } from "react-router";
import { ActivityCard } from "./activity-card";
import { MissionsApi } from "../../services/missions-service";
import { MissionModel } from "../../services/generated/mission-model";

interface ActivitiesTabProps extends RouteComponentProps {

}

class ActivitiesTabState {
    currentMission: MissionModel;
    currentActivityIndex = 0;
}

class ActivitiesTabComponent extends BaseComponent<ActivitiesTabProps, ActivitiesTabState>{

    async componentDidMount() {
        await this.refreshMissions();
    }

    async refreshMissions() {
        const missions = await MissionsApi.getMissions();

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