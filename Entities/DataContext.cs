using MongoDB.Driver;

namespace Entities
{
    public class DataContext
    {
        public DataContext(MongoDBConfig config)
        {
            this.MongoClient = new MongoClient(config.ConnectionString);
            this.Database = this.MongoClient.GetDatabase(config.Database);

            var observationsCollection = this.Observations;
            var model = new CreateIndexModel<Observation>(Builders<Observation>.IndexKeys.Geo2DSphere(o => o.Coordinates));
            observationsCollection.Indexes.CreateOne(model);
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

     

        public IMongoCollection<Mission> Missions
        {
            get
            {
                return this.Database.GetCollection<Mission>("Missions");
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
