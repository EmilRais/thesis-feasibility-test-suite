import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

import { Brand, Sale } from "./model";

describe("BetaApi | Endpoint 3A - POST /element/delete/brand/:id", () => {
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

    it("1. Afhænger et udsalg af det angivne brand skal endpointet returnere Bad Request.", () => {
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
                return agent.post("localhost:3031/element/delete/brand/brand-1")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(400);
                        response.text.should.equal("Brand er i brug hos et udsalg og kan ikke slettes");
                    });
            });
    });

    it("2. Eksisterer det angivne brand ikke skal endpointet returnere Bad Request.", () => {
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
                return agent.post("localhost:3031/element/delete/brand/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(400);
                        response.text.should.equal("Kunne ikke slette brand");
                    });
            });
    });

    it("3. Lykkes det at slette brandet, skal endpointet returnere OK.", () => {
        const brand: Brand = { _id: "some-id", value: "Nike", type: "BRAND" };
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
            .then(() => database.collection("Brands").insert(brand))
            .then(() => {
                return agent.post("localhost:3031/element/delete/brand/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);
                    });
            });
    });

    it("4. Lykkes det at slette brandet, forefindes brandet ikke længere i databasen.", () => {
        const brand: Brand = { _id: "some-id", value: "Nike", type: "BRAND" };
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
            .then(() => database.collection("Brands").insert(brand))
            .then(() => {
                return agent.post("localhost:3031/element/delete/brand/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        return database.collection("Brands").find().toArray()
                            .then(brands => brands.length.should.equal(0));
                    });
            });
    });

});
