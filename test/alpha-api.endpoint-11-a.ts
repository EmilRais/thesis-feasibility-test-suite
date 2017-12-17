import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

describe("AlphaApi | Endpoint 11A - POST /user/facebook/get", () => {
    let database: Db;
    let userId: string;
    let userToken: string;

    before(() => {
        return MongoClient.connect("mongodb://localhost:27017/database")
            .then(db => database = db)
            .then(() => {
                return agent.get("https://graph.facebook.com/1092068880930122/accounts/test-users")
                    .query({ access_token: "1092068880930122|470f440e050eb59788e7178c86ca982f" })
                    .then(response => {
                        const data = JSON.parse(response.text).data[0];
                        userId = data.id;
                        userToken = data.access_token;
                    });
            });
    });

    afterEach(() => {
       return database.dropDatabase();
    });

    after(() => {
        return database.close();
    });

    it("1. Er den angivne token ugyldig skal endpointet returnere Unauthorized.", () => {
        const credential = { type: "facebook", userId: userId, token: "some-invalid-token" };
        return agent.post("localhost:3030/user/facebook/get")
            .send(credential)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(401);
                response.text.should.equal("Ugyldigt Facebook-login");
            });
    });

    it("2. Findes ingen bruger med det angivne Facebook-brugerid skal endpointet returnere Not Acceptable.", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };
        return agent.post("localhost:3030/user/facebook/get")
            .send(credential)
            .catch(error => error.response)
            .then(response => {
                response.status.should.equal(406);
                response.text.should.equal("Bruger ikke oprettet");
            });
    });

    it("3. Findes en bruger med det angivne Facebook-brugerid skal endpointet returnere brugeren og OK.", () => {
        const credential = { type: "facebook", userId: userId, token: userToken };

        const user = {
            _id: "some-id",
            email: null as string,
            credential: { type: "facebook", userId: userId, token: null as string }
        };
        return database.collection("Users").insert(user)
            .then(() => {
                return agent.post("localhost:3030/user/facebook/get")
                    .send(credential)
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);
                        response.body.should.deep.equal(user);
                    });
            });
    });

});
