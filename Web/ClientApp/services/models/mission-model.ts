

export interface MissionModel {
    id: string;
    title: string;
    description: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
    $type: string;
}

export class VerificationMissionModel implements MissionModel {
    id: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
    title: string;
    description: string;
    unreliableObservation: boolean;// releve pas fiable donc si true on verifie tout les relevés isIdentified
    observationWithPics: boolean;//si true osef de ceux sans photos
    restriction: Restriction;// si !=null on verifie si c'est un genre/espece
    $type: string;
}

export class IdentificationMissionModel implements MissionModel {
    id: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
    title: string;
    description: string;
    restriction: Restriction;
    observationIdentified: string[];
    $type: string;
}

export class NewObservationMissionModel implements MissionModel {
    id: string;
    endingCondition: EndingCondition;
    restrictedArea: RestrictedArea;
    title: string;
    description: string;
    type: NewObservationMissionType;
    value: string;
    $type: string;
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
    genus: string;
    species: string;
}
export interface EndingCondition {
    $type: string;
}

export enum RestrictionType {
    ExactGender = 0,
    ExactSpecies = 1
}

export class NumberOfActions implements EndingCondition {
    number: number;
    $type: string;
}

export class TimeLimit implements EndingCondition {
    minutes: number;
    $type: string;
}

export interface RestrictedArea {
    $type: string;
}

export class PolygonArea implements RestrictedArea {
    polygon: CoordinateModel[];
    $type: string;
}

export class CircleAreaModel implements RestrictedArea {
    center: CoordinateModel;
    radius: number;
    $type: string;
}

export interface CoordinateModel {
    latitude: number;
    longitude: number;
}