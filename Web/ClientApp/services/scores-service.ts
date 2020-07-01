import { BaseService } from "./base-service";
import { ScoreUpdateModel } from "./models/score-update-model";

class ScoresServices extends BaseService {
    async updateScore(model: ScoreUpdateModel) {
        return await this.post<{ success: boolean }>("backup", model);
    }
}

export const ScoresApi = new ScoresServices();