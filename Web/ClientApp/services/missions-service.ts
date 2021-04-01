import { BaseService } from "./base-service";
import { MissionModel } from "./models/mission-model";
import { MissionProgressionCreationModel } from "./generated/mission-progression-creation-model";
import { ObservationCreationModel } from "./generated/observation-creation-model";
import { MissionHistoryModel } from "./generated/mission-history-model";


class MissionsService extends BaseService {
    async getMissions() {

        const remote = await this.get<MissionModel[]>("missions");

        return remote;
    }
    async startMission(model: MissionProgressionCreationModel) {
        const result = await this.post<MissionProgressionCreationModel>(`missions/startMission`, model);
        return result;
    } 
    async validateNewIdentification(identification: ObservationCreationModel, observationId: string) {
        const result = await this.post<boolean>(`missions/newIdentification/${observationId}`, identification);
        return result;
    }
    async getHistoryMission() {

        const result = await this.get<MissionHistoryModel[]>("missions/history");

        return result;
    }
    async timerIsEnd(missionId : string) {
        const result = await this.post<MissionProgressionCreationModel>(`missions/endTimer/${missionId}`, null);
        return result;
    } 
}

export const MissionsApi = new MissionsService();