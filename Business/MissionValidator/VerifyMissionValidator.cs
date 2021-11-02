using Entities;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public class VerifyMissionValidator : MissionValidator<VerificationMission>
    {
        public VerifyMissionValidator(VerificationMission mission, User user, ObservationsManager observationsManager, MissionsManager missionsManager, UsersManager usersManager) : base(mission, user, observationsManager, missionsManager, usersManager)
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

            //si ce n'est pas une action de création de proposition ou de confirmation ça ne concerne pas ce type de mission
            if (!type.HasValue || (type.Value != ActionType.CreateStatement && type.Value != ActionType.ConfirmStatement))
            {
                return false;
            }

            //Si on demande une observation avec photos mais qu'il y en a pas on ignore
            if (this.Mission.ObservationWithPics && (observation.Pictures == null || !observation.Pictures.Any()))
            {
                return false;
            }
            //Si on ne demande pas les observation fiable, et que l'observation modifié n'est pas déjà fiable.
            if (!this.Mission.UnreliableObservation && observation.StatementValidatedId == null)
            {
                return false;
            }

            Console.WriteLine(User.MissionProgress.History);
            var missionProgressHistory = User.MissionProgress.History?.ToList() ?? new List<MissionProgressionHistory>();
            var observationsFromHistory = await this.ObservationsManager.GetObservationsByIds(missionProgressHistory.Select(x => x.ObservationId).ToArray());

        
            //Question Est-ce que si le relevé est certains, on vérifie qu'il valide bien la bonne données

            if (this.Mission.Restriction != null)
            {
                var value = this.Mission.Restriction.Value?.ToLowerInvariant().RemoveDiacritics().Trim();
                if (!string.IsNullOrEmpty(value))
                {
                    switch (this.Mission.Restriction.Type)
                    {
                        case RestrictionType.ExactSpecies:
                            if (statement.CommonSpeciesName?.ToLowerInvariant().RemoveDiacritics().Trim() != value && statement.SpeciesName?.ToLowerInvariant().RemoveDiacritics().Trim() != value)
                            {
                                return false;
                            }
                            break;
                        case RestrictionType.ExactGender:
                            if (statement.CommonGenus?.ToLowerInvariant().RemoveDiacritics().Trim() != value && statement.Genus?.ToLowerInvariant().RemoveDiacritics().Trim() != value)
                            {
                                return false;
                            }
                            break;
                    }
                }

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
                await this.UsersManager.EndCurrentMission(userId: this.User.OsmId, missionProgressHistory.ToArray());
            }
            else
            {
                await this.UpdateProgression(missionProgressHistory.ToArray());
            }
            return false;
        }

    }
}
