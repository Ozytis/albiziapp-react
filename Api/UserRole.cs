using System;

namespace Api
{
    [Flags]
    public enum UserRole
    {
        None = 0,
        Expert = 1,
        Administrator = 2
    }
}
