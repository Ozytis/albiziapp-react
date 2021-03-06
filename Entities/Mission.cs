﻿using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    [BsonDiscriminator(Required = true, RootClass = true)]
    [BsonKnownTypes(typeof(NewObservationMission), typeof(IdentificationMission), typeof(VerificationMission))]
    public abstract class Mission
    {
        [BsonId]
        public string Id { get; set; }

        public EndingCondition EndingCondition { get; set; }

        public RestrictedArea RestrictedArea { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }
    }
}
