//----------------------
// <auto-generated>
//     Generated by Ozytis Model Generator  DO NOT EDIT!
// </auto-generated>
//----------------------

export interface MissionsCompleteModel {
    idMission: string;
    completedDate: string;
    activitiesCompleted: ActivityCompleteModel[];
}

export interface ActivityCompleteModel {
    idActivity: string;
    completedDate: string;
}
