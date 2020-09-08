import { BaseService } from "./base-service";
import { TitleModel } from "./generated/title-model";


class TitlesServices extends BaseService {
    async getTitles() {
        return await this.get<TitleModel[]>("titles");
    }
}

export const TitlesApi = new TitlesServices();