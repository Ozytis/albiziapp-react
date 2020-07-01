namespace Entities
{
    public class MongoDBConfig
    {
        public string Database { get; set; }
        
        public string Host { get; set; }
        
        public int Port { get; set; }
        
        public string User { get; set; }
        
        public string Password { get; set; }
      
        public string ConnectionString
        {
            get
            {
                if (string.IsNullOrEmpty(this.User) || string.IsNullOrEmpty(this.Password))
                {
                    return $@"mongodb://{this.Host}:{this.Port}";
                }

                return $@"mongodb://{this.User}:{this.Password}@{this.Host}:{this.Port}";
            }
        }
    }
}
