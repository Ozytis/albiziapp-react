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

    public class UserRoleName
    {
        public const string Expert = "Expert";
        public const string Administrator = "Administrator";
    }
}