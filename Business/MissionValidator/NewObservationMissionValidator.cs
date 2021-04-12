using Business.Utils;
using Entities;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public class NewObservationMissionValidator : MissionValidator<NewObservationMission>
    {
        public NewObservationMissionValidator(NewObservationMission mission, User user, ObservationsManager observationsManager, MissionsManager missionsManager, UsersManager usersManager) : base(mission, user, observationsManager, missionsManager, usersManager)
        {

        }

        public override async Task<bool> UpdateMissionProgression(Observation observation, ObservationStatement statement, ActionType? type)
        {
            bool conditionsCompleted = true;

            //Si la mission à une restriction géographique on vérifie que nous somme dedans
            if (!this.ValidateRestrictedArea(observation))
            {
                return false;
            }

            //si ce n'est pas une action de création de proposition ou d'observation ça ne concerne pas ce type de mission
            if (!type.HasValue || (type.Value != ActionType.CreateStatement && type.Value != ActionType.CreateObservation))
            {
                return false;
            }

            var missionProgressHistory = User.MissionProgress.History?.ToList() ?? new List<MissionProgressionHistory>();
            var observationsFromHistory = await this.ObservationsManager.GetObservationsByIds(missionProgressHistory.Select(x => x.ObservationId).ToArray());
            //Si on arrive la alors nous avons forcement un statement...
            if (missionProgressHistory.Any(h => h.ObservationId == observation.Id))
            {
                return false;
            }
            switch (this.Mission.Type)
            {
                case NewObservationMissionType.DifferentGenders:
                    if (observationsFromHistory.Any(x => x.ObservationStatements.Any(s => s.UserId == User.OsmId && s.CommonGenus.ToLowerInvariant().RemoveDiacritics() == statement.CommonGenus.ToLowerInvariant().RemoveDiacritics())))
                    {
                        return false;
                    }
                    break;
                case NewObservationMissionType.DifferentSpecies:
                    if (observationsFromHistory.Any(x => x.ObservationStatements.Any(s => s.UserId == User.OsmId && s.CommonSpeciesName.ToLowerInvariant().RemoveDiacritics() == statement.CommonSpeciesName.ToLowerInvariant().RemoveDiacritics())))
                    {
                        return false;
                    }
                    break;
                case NewObservationMissionType.ExactSpecies:
                    if (statement.CommonSpeciesName.ToLowerInvariant().RemoveDiacritics() != this.Mission.Value.ToLowerInvariant().RemoveDiacritics() || statement.SpeciesName.ToLowerInvariant().RemoveDiacritics() != this.Mission.Value.ToLowerInvariant().RemoveDiacritics())
                    {
                        return false;
                    }
                    break;
                case NewObservationMissionType.ExactGender:
                    if (!(statement.CommonGenus.RemoveDiacritics().ToLowerInvariant() == this.Mission.Value.RemoveDiacritics().ToLowerInvariant() || statement.Genus.RemoveDiacritics().ToLowerInvariant() == this.Mission.Value.RemoveDiacritics().ToLowerInvariant()))
                    {
                        return false;
                    }
                    break;
            }


            missionProgressHistory.Add(new MissionProgressionHistory
            {
                ObservationId = observation.Id,
                Date = DateTime.UtcNow,
                StatementId = statement?.Id,
                Type = type.Value
            });


            if (this.Mission.EndingCondition.GetType() == typeof(NumberOfActions))
            {
                NumberOfActions endCondition = (NumberOfActions)this.Mission.EndingCondition;
                if (missionProgressHistory.Count() < endCondition.Number)
                {
                    conditionsCompleted = false;
                }
            }
            if (this.Mission.EndingCondition.GetType() == typeof(TimeLimit))
            {
                TimeLimit timeLimit = (TimeLimit)this.Mission.EndingCondition;
                conditionsCompleted = this.IsTimerEnd(timeLimit.Minutes, User.MissionProgress.StartDate);
            }
            if (conditionsCompleted)
            {
                await this.UsersManager.EndCurrentMission(userId:this.User.OsmId,missionProgressHistory.ToArray());
            }
            else
            {
                await this.UpdateProgression(missionProgressHistory.ToArray());
            }

            return true;
        }

    }
}
