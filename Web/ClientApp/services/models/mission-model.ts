

export interface MissionModel {
    id: string;
    title: string;
    description: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
}

export class VerificationMissionModel implements MissionModel {
    id: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
    title: string;
    description: string;
    unreliableObservation: boolean;
    observationWithPics: boolean;
    restriction: Restriction;
}

export class IdentificationMissionModel implements MissionModel {
    id: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
    title: string;
    description: string;
    restriction: Restriction;
    observationIdentified: string[];
}

export class NewObservationMissionModel implements MissionModel {
    id: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
    title: string;
    description: string;
    type: NewObservationMissionType;
    value: string;
}

export enum NewObservationMissionType {
    DifferentGenders = 0,
    DifferentSpecies = 1,
    ExactGender = 2,
    ExactSpecies = 3
}

export interface Restriction {
    type: RestrictionType;
    value: string;
}
export interface EndingCondition {

}

export enum RestrictionType {
    ExactGender = 0,
    ExactSpecies = 1
}

export class NumberOfActions implements EndingCondition {
    number: number;
}

export class TimeLimit implements EndingCondition {
    minutes: number;
}

export interface RestrictedArea {

}

export class PolygonArea implements RestrictedArea {
    polygon: CoordinateModel[];
}

export class CircleAreaModel implements RestrictedArea {
    center: CoordinateModel;
    radius: number;
}

export interface CoordinateModel {
    latitude: number;
    longitude: number;
}