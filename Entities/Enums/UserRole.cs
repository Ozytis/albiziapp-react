using System;

namespace Entities.Enums
{
    [Flags]
    public enum UserRole
    {
        NONE = 0,
        EXPERT = 1,
        ADMINISTRATOR= 2
    }
}
