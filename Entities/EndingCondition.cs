using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    [BsonDiscriminator(Required = true)]
    [BsonKnownTypes(typeof(TimeLimit), typeof(NumberOfActions))]
    public abstract class EndingCondition
    {
    }
}
