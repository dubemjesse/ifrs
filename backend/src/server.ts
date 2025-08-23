import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { connect } from "./db";

const app = express();
const port = 3333;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

connect()
  .then(async (pool) => {
    console.log("Connected to IFRS DB successfully");

    // Test query to fetch first 5 records from ifrs_trial_balance
    try {
      const result = await pool
        .request()
        .query("SELECT TOP 5 * FROM ifrs_trial_balance");
      console.log("First 5 records from ifrs_trial_balance:");
      console.log(result.recordset);
    } catch (queryErr) {
      console.log("Error querying ifrs_trial_balance:");
      console.log(queryErr);
    }
  })
  .catch((err) => {
    console.log("Error connecting to the database");
    console.log(err);
  });

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`IFRS app listening on port ${port}`);
});
