//----------------------
// <auto-generated>
//     Generated by Ozytis Model Generator  DO NOT EDIT!
// </auto-generated>
//----------------------

import { RestrictedAreaModel } from "./restricted-area-model";
import { CoordinateModel } from "./coordinate-model";
export interface CircleAreaModel extends RestrictedAreaModel
{
    center: CoordinateModel;
    radius: number;
}
