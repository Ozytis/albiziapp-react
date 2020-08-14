using MongoDB.Driver;

namespace Entities
{
    public class DataContext
    {
        public DataContext(MongoDBConfig config)
        {
            this.MongoClient = new MongoClient(config.ConnectionString);
            this.Database = this.MongoClient.GetDatabase(config.Database);
        }

        public IMongoCollection<User> Users
        {
            get
            {
                return this.Database.GetCollection<User>("Users");
            }
        }

        public IMongoCollection<Observation> Observations
        {
            get
            {
                return this.Database.GetCollection<Observation>("Observations");
            }
        }

        public IMongoCollection<Species> Species
        {
            get
            {
                return this.Database.GetCollection<Species>("Species");
            }
        }

        public IMongoCollection<FloraKey> FloraKeys
        {
            get
            {
                return this.Database.GetCollection<FloraKey>("FloraKeys");
            }
        }

        public IMongoCollection<Activity> Activities
        {
            get
            {
                return this.Database.GetCollection<Activity>("Activities");
            }
        }

        public IMongoCollection<Mission> Missions
        {
            get
            {
                return this.Database.GetCollection<Mission>("Missions");
            }
        }

        public IMongoCollection<Trophy> Trophies
        {
            get
            {
                return this.Database.GetCollection<Trophy>("Trophies");
            }
        }

        public IMongoCollection<Title> Titles
        {
            get
            {
                return this.Database.GetCollection<Title>("Titles");
            }
        }

        public MongoClient MongoClient { get; }

        public IMongoDatabase Database { get; }
    }
}
