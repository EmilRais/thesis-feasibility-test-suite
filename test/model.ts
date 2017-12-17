export interface Sale {
    _id: string;
    name: string;
    location: Location;
    openingHours: string;
    fromDate: number;
    toDate: number;
    paymentOptions: PaymentOption[];
    types: Type[];
    brand: Brand;
    description: string;
    logo: string;
}

interface Location {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    postalCode: string;
}

export interface PaymentOption {
    _id: string;
    value: string;
    type: "PAYMENT_OPTION";
}

export interface Type {
    _id: string;
    value: string;
    type: "TYPE";
}

export interface Brand {
    _id: string;
    value: string;
    type: "BRAND";
}
