import * as chai from "chai";
const should = chai.should();

import { Db, MongoClient } from "mongodb";
import * as agent from "superagent";

import { PaymentOption, Sale } from "./model";

describe("BetaApi | Endpoint 3B - POST /element/delete/payment-option/:id", () => {
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

    it("should return bad request when sale relies on payment option", () => {
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
                return agent.post("localhost:3031/element/delete/payment-option/payment-1")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(400);
                        response.text.should.equal("Betalingsmulighed er i brug hos et udsalg og kan ikke slettes");
                    });
            });
    });

    it("should have removed payment option from all sales when succesful", () => {
        const paymentOption: PaymentOption = { _id: "some-id", value: "Cash", type: "PAYMENT_OPTION" };
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }, paymentOption],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => database.collection("PaymentOptions").insert(paymentOption))
            .then(() => {
                return agent.post("localhost:3031/element/delete/payment-option/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        return database.collection("Sales").findOne({ _id: "id-1" })
                            .then(storedSale => storedSale.paymentOptions.length.should.equal(1));
                    });
            });
    });

    it("should return bad request when payment option is not deleted", () => {
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
                return agent.post("localhost:3031/element/delete/payment-option/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(400);
                        response.text.should.equal("Kunne ikke slette betalingsmulighed");
                    });
            });
    });

    it("should return ok when succesful", () => {
        const paymentOption: PaymentOption = { _id: "some-id", value: "Cash", type: "PAYMENT_OPTION" };
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }, paymentOption],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => database.collection("PaymentOptions").insert(paymentOption))
            .then(() => {
                return agent.post("localhost:3031/element/delete/payment-option/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        response.status.should.equal(200);
                    });
            });
    });

    it("should have deleted the payment option when succesful", () => {
        const paymentOption: PaymentOption = { _id: "some-id", value: "Cash", type: "PAYMENT_OPTION" };
        const sale: Sale = {
            _id: "id-1",
            name: "some-sale",
            location: { latitude: 0, longitude: 0, address: "some-address", city: "some-city", postalCode: "some-postal-code" },
            openingHours: "some-opening-hours",
            fromDate: 0,
            toDate: 1000,
            paymentOptions: [{ _id: "payment-1", value: "CreditCard", type: "PAYMENT_OPTION" }, paymentOption],
            types: [{ _id: "type-1", value: "Furniture", type: "TYPE" }],
            brand: { _id: "brand-1", value: "Adidas", type: "BRAND" },
            description: "some-description",
            logo: "some-logo"
        };

        return database.collection("Sales").insert(sale)
            .then(() => database.collection("PaymentOptions").insert(paymentOption))
            .then(() => {
                return agent.post("localhost:3031/element/delete/payment-option/some-id")
                    .catch(error => error.response)
                    .then(response => {
                        return database.collection("PaymentOptions").find().toArray()
                            .then(result => result.length.should.equal(0));
                    });
            });
    });

});
