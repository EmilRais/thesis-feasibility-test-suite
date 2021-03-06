import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

import { PaymentOption, Sale, Type } from "./model";

describe("BetaApi | Endpoint 3C - POST /element/delete/type/:id", () => {
    let database: Db;

    before(() => {
        return MongoClient.connect("mongodb://localhost:27017/database")
            .then(db => database = db);
    });

    afterEach(() => {
       return database.dropDatabase();
    });

    after(() => {
        return database.close();
    });

    it("1. Afhænger et udsalg af den angivne type skal endpointet returnere Bad Request.", () => {
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => {
                return agent.post("localhost:3031/element/delete/type/type-1")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(400);
                        response.text.should.equal("Type er i brug hos et udsalg og kan ikke slettes");
                    });
            });
    });

    it("2. Typen skal være fjernet fra eventuelle udsalg.", () => {
        const type: Type = { _id: "some-id", value: "Clothing", type: "TYPE" };
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }, type],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => database.collection("Types").insert(type))
            .then(() => {
                return agent.post("localhost:3031/element/delete/type/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        return database.collection("Sales").findOne({ _id: "id-1" })
                            .then(storedSale => storedSale.types.length.should.equal(1));
                    });
            });
    });

    it("3. Eksisterer den angivne type ikke skal endpointet returnere Bad Request.", () => {
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => {
                return agent.post("localhost:3031/element/delete/type/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(400);
                        response.text.should.equal("Kunne ikke slette type");
                    });
            });
    });

    it("4. Lykkes det at slette typen, skal endpointet returnere OK.", () => {
        const type: Type = { _id: "some-id", value: "Clothing", type: "TYPE" };
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }, type],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => database.collection("Types").insert(type))
            .then(() => {
                return agent.post("localhost:3031/element/delete/type/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);
                    });
            });
    });

    it("5. Lykkes det at slette typen, forefindes typen ikke længere i databasen.", () => {
        const type: Type = { _id: "some-id", value: "Clothing", type: "TYPE" };
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }, type],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => database.collection("Types").insert(type))
            .then(() => {
                return agent.post("localhost:3031/element/delete/type/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        return database.collection("Types").find().toArray()
                            .then(result => result.length.should.equal(0));
                    });
            });
    });

});
