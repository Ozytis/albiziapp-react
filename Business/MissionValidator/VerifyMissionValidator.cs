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
        public VerifyMissionValidator(VerificationMission mission, User user, ObservationsManager observationsManager, MissionsManager missionsManager, UsersManager usersManager) : base(mission,user, observationsManager, missionsManager, usersManager)
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
            if(!this.Mission.UnreliableObservation && observation.StatementValidatedId == null)
            {
                return false;
            }
            Console.WriteLine(User.MissionProgress.History);
            var missionProgressHistory = User.MissionProgress.History?.ToList() ?? new List<MissionProgressionHistory>();
            var observationsFromHistory = await this.ObservationsManager.GetObservationsByIds(missionProgressHistory.Select(x => x.ObservationId).ToArray());

            //TODO vérification des type de donénes botanique
            //Question Est-ce que si le relevé est certains, on vérifie qu'il valide bien la bonne données

            if(this.Mission.Restriction != null)
            {
                switch (this.Mission.Restriction.Type)
                {                    
                    case RestrictionType.ExactSpecies:
                        if (statement.CommonSpeciesName != this.Mission.Restriction.Value && statement.SpeciesName != this.Mission.Restriction.Species)
                        {
                            return false;
                        }
                        break;
                    case RestrictionType.ExactGender:
                        if (statement.CommonGenus.ToLowerInvariant().RemoveDiacritics() != this.Mission.Restriction.Value.ToLowerInvariant().RemoveDiacritics() && statement.Genus.ToLowerInvariant().RemoveDiacritics() != this.Mission.Restriction.Genus.ToLowerInvariant().RemoveDiacritics())
                        {
                            return false;
                        }
                        break;
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

            /* var opts = Activity.Options;           
             int count = 0;
             foreach (var endCondition in this.Activity.EndConditions)
             {
                 if (endCondition.ActionCount.HasValue)
                 {
                     var observations = (await this.ObservationsManager.GetUserVerifyObservations(User.OsmId, User.MissionProgress.StartDate));
                     count = observations.Count();

                     if (count < endCondition.ActionCount.Value)
                     {
                         conditionsCompleted = false;
                     }

                 }
                 if (endCondition.Time.HasValue)
                 {
                     var maxDate = DateTime.UtcNow.AddMinutes(-endCondition.Time.Value);
                     var date = new DateTime(Math.Max(User.MissionProgress.StartDate.Ticks, maxDate.Ticks));
                     var observations = (await this.ObservationsManager.GetUserVerifyObservations(User.OsmId,date)); ;
                     count = observations.Count();                

                     //todo check code existant mini requis
                     if (count < 5)
                     {
                         conditionsCompleted = false;
                     }
                 }
             }

             if (conditionsCompleted)
             {
                 await this.ValidateActivity();
             }
             else
             {
                 await this.UpdateProgression(count);
                 //todo updateMissionProgression
             }

             return conditionsCompleted;*/
            return false;
        }
       
    }
}
