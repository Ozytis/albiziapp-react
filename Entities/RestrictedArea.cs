using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Text;

namespace Entities
{
    [BsonDiscriminator(Required = true)]
    [BsonKnownTypes(typeof(CircleArea), typeof(PolygonArea))]
    public abstract class RestrictedArea
    {
    }
}
