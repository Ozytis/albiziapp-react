import { BaseService } from "./base-service";
import { MissionModel } from "./models/mission-model";
import { MissionProgressionCreationModel } from "./generated/mission-progression-creation-model";


class MissionsService extends BaseService {
    async getMissions() {

        const remote = await this.get<MissionModel[]>("missions");

        return remote;
    }
    async startMission(model: MissionProgressionCreationModel) {
        const result = await this.post<MissionProgressionCreationModel>(`missions/startMission`, model);
        return result;
    }   
}

export const MissionsApi = new MissionsService();