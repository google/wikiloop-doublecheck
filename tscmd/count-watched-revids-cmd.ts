async function main() {
  const COLLECTION = `WatchCollection_US2020`;
  const Bottleneck = require("bottleneck");
  let neck = new Bottleneck({
    minTime: 2000
  });
  require(`dotenv`).config();
  const mongoose = require('mongoose');
  await mongoose.connect(process.env.MONGODB_URI, {useUnifiedTopology: true, useNewUrlParser: true});

  let ret = await mongoose.connection.db.collection(COLLECTION)
                .aggregate([{
                  "$group": {
                    "_id": "totalRevIds", "num": {
                      "$sum": {"$size": "$revIds"}
                    }
                  }
                }], {
                  "allowDiskUse": false
                })
      .toArray();
  console.log(ret);
}

main().then(() => {
  process.exit(0);
});
