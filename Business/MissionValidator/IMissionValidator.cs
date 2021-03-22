using Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Business.MissionValidation
{
    public interface IMissionValidator
    {
        public Task<bool> UpdateMissionProgression(Observation observation, ObservationStatement statement, ActionType? type);
    }
}
