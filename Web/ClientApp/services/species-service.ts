import { BaseService } from "./base-service";
import { TreeGenusModel } from "./models/tree-species";
import { SpeciesModel } from "./generated/species-model";
import { SpeciesInfoModel } from "./generated/species-info-model";
import { FloraKeyModel } from "./generated/flora-key-model";

class SpeciesService extends BaseService {

    constructor() {
        super();

        const jsonSpecies = localStorage.getItem("species");

        if (jsonSpecies) {
            this.species = JSON.parse(jsonSpecies);
            this.onSpeciesLoaded();
        }
    }

    species: SpeciesModel[];

    private async onSpeciesLoaded() {
        for (const listener of this.listeners) {
            await listener();
        }
    }


    async loadSpecies() {

        const species = await this.get<SpeciesModel[]>("species");
        localStorage.setItem("species", JSON.stringify(species));
        this.species = species;

        this.onSpeciesLoaded();
        return species;
    }

    async getAllSpecies() {
        return this.species;
    }

    async getAllFloraKeys() {
        return await this.get<FloraKeyModel[]>("species/keys");
    }

    async getAllGenus() {

        if (!this.species) {
            return null;
        }

        return this.species
            .map(s => { return { genus: s.genus, commonGenus: s.commonGenus } as TreeGenusModel })
            .filter((genus, index, self) => self.findIndex(g => g.genus === genus.genus) === index);
    }

    private listeners: (() => Promise<void>)[] = [];

    registerSpeciesListener(callback: () => Promise<void>) {
        this.listeners.push(callback);
        return callback;
    }

    unregisterSpeciesListener(callback: () => Promise<void>) {
        const index = this.listeners.indexOf(callback);

        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    async getSpeciesInfo(telaBotanicaTaxon: string) {
        return await this.get<SpeciesInfoModel>(`species/${telaBotanicaTaxon}`);
    }
}

export const SpeciesApi = new SpeciesService();