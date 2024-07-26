import mongoose from "mongoose";

class DbService {
  private static readonly dbUri: string = process.env.DB_URI || "";

  public static async connect() {
    try {
      await mongoose.connect(this.dbUri);
      console.log("Db Connected.");
    } catch (error) {
      console.log(error);
    }
  }
}

export default DbService;
