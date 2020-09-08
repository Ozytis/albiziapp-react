import { BaseService } from "./base-service";
import { TrophyModel } from "./generated/trophy-model";


class TrophiesServices extends BaseService {
    async getTrophies() {
        return await this.get<TrophyModel[]>("trophies");
    }
}

export const TrophiesApi = new TrophiesServices();