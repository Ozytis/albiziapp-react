import { BaseService } from "./base-service";
import { FoliaRequestModel } from "./generated/folia-request-model";
import { FoliaResultModel } from "./generated/folia-result-model";

class FoliaServices extends BaseService {
    async requestFolia(model: FoliaRequestModel) {
        const result = await this.post<FoliaResultModel[]>(`folia`, model);
        return result;
    }
}

export const FoliaApi = new FoliaServices();