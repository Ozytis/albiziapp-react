using Entities;
using Ozytis.Common.Core.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public class IdentifyMissionValidator : MissionValidator<IdentificationMission>
    {
        public IdentifyMissionValidator(IdentificationMission mission, User user, ObservationsManager observationsManager, MissionsManager missionsManager, UsersManager usersManager) : base(mission, user, observationsManager, missionsManager, usersManager)
        {

        }

#pragma warning disable CS1998 // Async method lacks 'await' operators and will run synchronously
        public override async Task<bool> UpdateMissionProgression(Observation observation, ObservationStatement statement, ActionType? type)
#pragma warning restore CS1998 // Async method lacks 'await' operators and will run synchronously
        {            
            return false;
        }
        public async Task<bool> UpdateIdentifyMissionProgression(string observationId, Mission mission, ObservationStatement identification,  string osmId)
        {
            bool isMissionCompleted = false;
            bool isIdentified = true;
            Observation observation = await this.ObservationsManager.GetObservationbyId(observationId);
            ObservationStatement observationStatement = observation.ObservationStatements.FirstOrDefault(x => x.Id == observation.StatementValidatedId);
            if(mission.GetType() == typeof(NewObservationMission) || mission.GetType() == typeof(VerificationMission))
            {
                return false;
            }
            IdentificationMission identifyMission = (IdentificationMission)mission;
            if (identifyMission.Restriction == null || string.IsNullOrEmpty(identifyMission.Restriction.Value))
            {
                if(!(observationStatement.Genus == identification.Genus && observationStatement.SpeciesName == identification.SpeciesName))
                {
                    isIdentified = false;
                }
            }
            else
            {
                var value = identifyMission.Restriction.Value.ToLowerInvariant().RemoveDiacritics().Trim();
                if (identifyMission.Restriction.Type == RestrictionType.ExactGender)
                {
                    if(value != identification.Genus?.ToLowerInvariant().RemoveDiacritics().Trim() && value != identification.CommonGenus?.ToLowerInvariant().RemoveDiacritics().Trim())
                    {
                        isIdentified = false;
                    }
                }
                else if(identifyMission.Restriction.Type == RestrictionType.ExactSpecies)
                {
                    if (value != identification.SpeciesName?.ToLowerInvariant().RemoveDiacritics().Trim() && value != identification.CommonSpeciesName?.ToLowerInvariant().RemoveDiacritics().Trim())
                    {
                        isIdentified = false;
                    }
                }
            }
            User user = await this.UsersManager.SelectAsync(osmId);

            var missionProgressHistory = user.MissionProgress.History?.ToList() ?? new List<MissionProgressionHistory>();
            missionProgressHistory.Add(new MissionProgressionHistory
            {
                ObservationId = observation.Id,
                Date = DateTime.UtcNow,
                StatementId = observationStatement?.Id,
                Type = ActionType.Recognition,
                Gender = identification.Genus,
                Species = identification.SpeciesName,
                SuccessRecognition = isIdentified 
            }) ;
            user.MissionProgress.Progression += isIdentified ? 1 : 0;
            if (identifyMission.EndingCondition.GetType() == typeof(NumberOfActions))
            {
                NumberOfActions numberOfActions = (NumberOfActions)identifyMission.EndingCondition;
                if(user.MissionProgress.Progression == numberOfActions.Number)
                {
                    isMissionCompleted = true;
                }
            }
            if(identifyMission.EndingCondition.GetType() == typeof(TimeLimit))
            {
                TimeLimit timeLimit = (TimeLimit)identifyMission.EndingCondition;
                if(this.IsTimerEnd(timeLimit.Minutes, user.MissionProgress.StartDate))
                {
                    isMissionCompleted = true;
                }
            }
            if (isMissionCompleted )
            {
                await this.UsersManager.EndCurrentMission(osmId, missionProgressHistory.ToArray());
            }
            else
            {
                await this.UpdateProgression(missionProgressHistory.ToArray(), true, isIdentified);
            }
            return isIdentified;
        }
    }
}
