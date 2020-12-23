import { BaseService } from "./base-service";
import { LatLng } from "leaflet";
import { SpeciesApi } from "./species-service";
import { ObservationModel } from "./generated/observation-model";
import { ObservationCreationModel } from "./generated/observation-creation-model";
import { ObservationEditionModel } from "./generated/observation-edition-model";
import { ObservationStatementModel } from "./generated/observation-statement-model";
import { ObservationStatementConfirmationModel } from "./generated/observation-statement-confirmation-model";
import { AddObservationStatementConfirmationModel } from "./generated/add-observation-statement-confirmation-model";

class ObservationsService extends BaseService {

    async getUserObservations(userId: string) {
        return await this.get<ObservationModel[]>(`users/${userId}/observations`);
    }
 

    constructor() {
        super();

        if (localStorage.getItem("nextObservationCoordinates")) {
            this.nextObservationCoordinates = JSON.parse(localStorage.getItem("nextObservationCoordinates"));
        }
    }

    private nextObservationCoordinates: number[];

    getNextObservationCoordinates() {
        return this.nextObservationCoordinates;
    }

    async setNextObservationCoordinates(latlng: LatLng) {
        this.nextObservationCoordinates = [latlng.lat, latlng.lng];
        localStorage.setItem("nextObservationCoordinates", JSON.stringify(this.nextObservationCoordinates));
    }

    async createObservation(observation: ObservationCreationModel) {

        const result = await this.post<ObservationModel>(`observations`, observation);

        if (result.success) {
            this.loadObservations();
        }

        return result;
    }

    async addStatement(statement: ObservationCreationModel, observationId: string) {

        const result = await this.post<ObservationModel>(`observations/addStatement/${observationId}`, statement);

        if (result.success) {
            this.loadObservations();
        }

        return result;
    }

    async editObservation(observation: ObservationEditionModel) {

        const result = await this.put<ObservationModel>(`observations`, observation);

        if (result.success) {
            this.loadObservations();
        }

        return result;
    }

    async deleteObservation(observation: ObservationModel) {

        const result = await this.delete(`observations/${observation.id}`);

        if (!result.success) {
            return result;
        }

        this.loadObservations();

        return result;
    }
    async ValidateObservation(observation: ObservationModel) {

        const result = await this.put(`observations/validate/${observation.id}`,null);

        if (!result.success) {
            return result;
        }

        this.loadObservations();

        return result;
    }


    private observations: ObservationModel[];

    private async onObservationsLoaded() {
        for (const listener of this.listeners) {
            await listener();
        }
    }

    async loadObservations() {

        try {
            const observations = await this.get<ObservationModel[]>(`observations`);
            this.observations = observations;

            await this.onObservationsLoaded();
        }
        catch { // eslint-disable

        }

        return this.observations;
    }

    async getObservations() {
        return this.observations;
    }

    private listeners: (() => Promise<void>)[] = [];

    registerObservationsListener(callback: () => Promise<void>) {
        this.listeners.push(callback);
        return callback;
    }

    unregisterObservationsListener(callback: () => Promise<void>) {
        const index = this.listeners.indexOf(callback);

        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    async getObservation(observationId: string) {

        if (!this.observations) {
            await this.loadObservations();
        }

        return this.observations && this.observations.find(o => o.id === observationId);
    }

    async confirmStatement(statementConfirmation: AddObservationStatementConfirmationModel) {

        const result = await this.post(`observations/confirmStatement`, statementConfirmation);

        if (result.success) {
            this.loadObservations();
        }

        return result;
    }

    async getUserArboretum(userId: string) {

        const observations = await this.getUserObservations(userId);

        const species = await SpeciesApi.getAllSpecies();

        return observations
            .map(o => o.speciesName)
            .filter((species, index, self) => self.indexOf(species) === index)
            .map(speciesName => {
                return {
                    species: species.find(s => s.speciesName === speciesName),
                    nbOfViews: observations.filter(o => o.speciesName === speciesName).length
                }
            }).filter(o => o.species != null)
            .sort((s1, s2) => s1.species.speciesName.localeCompare(s2.species.speciesName));
    }

    async notifError(userId: string, error: string) {
        const result = await this.post(`observations/errorNotif/${userId}/${error}`, null);
        return result;
    }

    async notifInfo(userId: string, error: string) {
        const result = await this.post(`observations/infoNotif/${userId}/${error}`, null);
        return result;
    }

   }

export const ObservationsApi = new ObservationsService();