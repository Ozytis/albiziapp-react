import { BaseService } from "./base-service";
import { MissionModel } from "./generated/mission-model";


class MissionsService extends BaseService {
    async getMissions() {

        const remote = await this.get<MissionModel[]>("missions");

        return remote;
    }   
}

export const MissionsApi = new MissionsService();