using Api.Missions;
using Entities;
using MongoDB.Driver.GeoJsonObjectModel;
using System;
using System.Linq;

namespace Web.Mappings
{
    public static class MissionMappings
    {
        public static MissionModel ToMissionModel(this Mission mission)
        {

            MissionModel model = null;
            if (mission.GetType() == typeof(NewObservationMission))
            {
                model = ((NewObservationMission)mission).ToNewObersationMissionModel();

            }
            else if (mission.GetType() == typeof(VerificationMission))
            {
                model = ((VerificationMission)mission).ToVerificationMissionModel();
            }
            else if (mission.GetType() == typeof(IdentificationMission))
            {
                model = ((IdentificationMission)mission).ToIdentificationMissionModel();
            }

            model.Id = mission.Id;
            model.Title = mission.Title;
            model.Description = mission.Description;
            model.EndingCondition = mission.EndingCondition?.ToEndingConditionModel();
            model.RestrictedArea = mission.RestrictedArea?.ToRestrictedAreaModel();

            return model;

        }
        public static NewObservationMissionModel ToNewObersationMissionModel(this NewObservationMission mission)
        {
            var model = new NewObservationMissionModel();
            model.Type = (NewObservationMissionTypeModel)mission.Type;
            model.Value = mission.Value;
            return model;
        }

        public static VerificationMissionModel ToVerificationMissionModel(this VerificationMission mission)
        {
            var model = new VerificationMissionModel();
            model.ObservationWithPics = mission.ObservationWithPics;
            model.UnreliableObservation = mission.UnreliableObservation;
            model.Restriction = mission.Restriction?.ToRestrictionModel();
            return model;
        }

        public static IdentificationMissionModel ToIdentificationMissionModel(this IdentificationMission mission)
        {
            var model = new IdentificationMissionModel();
            model.ObservationIdentified = mission.ObservationIdentified;
            model.Restriction = mission.Restriction?.ToRestrictionModel();
            return model;
        }


        public static EndingConditionModel ToEndingConditionModel(this EndingCondition endingCondition)
        {
            if (endingCondition.GetType() == typeof(TimeLimit))
            {
                return new TimeLimitModel()
                {
                    Minutes = ((TimeLimit)endingCondition).Minutes
                };
            }
            else
            {
                return new NumberOfActionsModel()
                {
                    Number = ((NumberOfActions)endingCondition).Number
                };
            }
        }

        public static RestrictedAreaModel ToRestrictedAreaModel(this RestrictedArea restrictedArea)
        {
            if (restrictedArea.GetType() == typeof(CircleArea))
            {
                return new CircleAreaModel()
                {
                    Center = ((CircleArea)restrictedArea).Center?.ToCoordinateModel(),
                    Radius = ((CircleArea)restrictedArea).Radius

                };
            }
            else
            {
                return new PolygonAreaModel()
                {
                    Polygon = ((PolygonArea)restrictedArea).Polygon?.Coordinates.Exterior.Positions.Select(x => new CoordinateModel { Latitude =  x.Latitude,Longitude = x.Longitude }).ToArray()
                };
            }
        }


        public static CoordinateModel ToCoordinateModel(this GeoJsonPoint<GeoJson2DGeographicCoordinates> point)
        {
            return new CoordinateModel
            {
                Latitude = point.Coordinates.Latitude,
                Longitude = point.Coordinates.Longitude
            };
        }

        public static RestrictionModel ToRestrictionModel(this Restriction restriction)
        {
            return new RestrictionModel()
            {
                Type = (RestrictionTypeModel)restriction.Type,
                Value = restriction.Value,
            };
        }


        public static Mission ToMission(this MissionModel model)
        {
            Mission mission = null;
            if (model.GetType() == typeof(NewObservationMissionModel))
            {
                mission = ((NewObservationMissionModel)model).ToNewObersationMission();
            }
            else if (model.GetType() == typeof(VerificationMissionModel))
            {
                mission = ((VerificationMissionModel)model).ToVerificationMission();
            }
            else if (model.GetType() == typeof(IdentificationMissionModel))
            {
                mission = ((IdentificationMissionModel)model).ToIdentificationMission();
            }

            mission.Id = model.Id;
            mission.Title = model.Title;
            mission.Description = model.Description;
            mission.EndingCondition = model.EndingCondition?.ToEndingCondition();
            mission.RestrictedArea = model.RestrictedArea?.ToRestrictedArea();

            return mission;
        }

        public static NewObservationMission ToNewObersationMission(this NewObservationMissionModel model)
        {
            var mission = new NewObservationMission();
            mission.Type = (NewObservationMissionType)model.Type;
            mission.Value = model.Value;
            return mission;
        }

        public static VerificationMission ToVerificationMission(this VerificationMissionModel model)
        {
            var mission = new VerificationMission();
            mission.ObservationWithPics = model.ObservationWithPics;
            mission.UnreliableObservation = model.UnreliableObservation;
            mission.Restriction = model.Restriction?.ToRestriction();
            return mission;
        }

        public static Restriction ToRestriction(this RestrictionModel restriction)
        {
            return new Restriction()
            {
                Type = (RestrictionType)restriction.Type,
                Value = restriction.Value,
            };
        }

        public static IdentificationMission ToIdentificationMission(this IdentificationMissionModel model)
        {
            var mission = new IdentificationMission();
            mission.ObservationIdentified = model.ObservationIdentified;
            mission.Restriction = model.Restriction?.ToRestriction();
            return mission;
        }

        public static EndingCondition ToEndingCondition(this EndingConditionModel endingCondition)
        {
            if (endingCondition.GetType() == typeof(TimeLimitModel))
            {
                return new TimeLimit()
                {
                    Minutes = ((TimeLimitModel)endingCondition).Minutes
                };
            }
            else
            {
                return new NumberOfActions()
                {
                    Number = ((NumberOfActionsModel)endingCondition).Number
                };
            }
        }

        public static RestrictedArea ToRestrictedArea(this RestrictedAreaModel restrictedArea)
        {
            if (restrictedArea.GetType() == typeof(CircleAreaModel))
            {
                return new CircleArea()
                {
                    Center = new GeoJsonPoint<GeoJson2DGeographicCoordinates>(new GeoJson2DGeographicCoordinates(((CircleAreaModel)restrictedArea).Center.Longitude, ((CircleAreaModel)restrictedArea).Center.Latitude)) ,
                    Radius = ((CircleAreaModel)restrictedArea).Radius

                };
            }
            else
            {
                return new PolygonArea()
                {
                    Polygon = GeoJson.Polygon(((PolygonAreaModel)restrictedArea).Polygon.Select(x => new  GeoJson2DGeographicCoordinates( x.Longitude,  x.Latitude )).ToArray())
                };
            }
        }
    }
}
