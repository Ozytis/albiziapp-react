//----------------------
// <auto-generated>
//     Generated by Ozytis Model Generator  DO NOT EDIT!
// </auto-generated>
//----------------------

import { ObservationStatementModel } from "./observation-statement-model";
export interface ObservationModel {
    commonGenus: string;
    commonSpeciesName: string;
    confident: number;
    date: string;
    genus: string;
    pictures: string[];
    id: string;
    latitude: number;
    longitude: number;
    speciesName: string;
    userId: string;
    telaBotanicaTaxon: string;
    authorName: string;
    isIdentified: boolean;
    observationStatements: ObservationStatementModel[];
}
