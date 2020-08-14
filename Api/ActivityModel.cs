namespace Api
{
    public class ActivityModel
    {
        public string[] Options { get; set; }

        public ActivityInstructionModel Instructions { get; set; }

        public string Id { get; set; }

        public int Type { get; set; }

        public int Order { get; set; }

        public ActivityEndConditionModel[] EndConditions { get; set; }
    }
}
