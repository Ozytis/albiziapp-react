import { BaseService } from "./base-service";

class ActivitiesService extends BaseService{    
    INVENTORY = 1;
    VERIFY = 2;
    IDENTIFY = 4;

}

export const ActivitiesApi = new ActivitiesService();