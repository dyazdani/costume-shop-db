// @ts-nocheck

// *** FOR JEST TESTING ***

// Functions for creating costume objects for testing
const getBallroomGown = () => {
    return {
        name: "ballroom gown",
        category: "adult",
        gender: "female",
        size: "L",
        type: "dress",
        stockCount: 1,
        price: 150.99
    }
}

const getBigBallroomGown = () => {
    return {
        name: "big ballroom gown",
        category: "adult",
        gender: "female",
        size: "L",
        type: "dress",
        stockCount: 1,
        price: 150.99
    }
}

const getButtlessChaps = () => {
    return {
        name: "buttless chaps",
        category: "adult",
        gender: "unisex",
        size: "M",
        type: "pants",
        stockCount: 3,
        price: 75.99
    }
}

const getButtfulChaps = () => {
    return {
        name: "buttful chaps",
        category: "adult",
        gender: "unisex",
        size: "L",
        type: "pants",
        stockCount: 1,
        price: 84.99
    }
}

const getBonnet = () => {
    return {
        name: "bonnet",
        category: "child",
        gender: "female",
        size: "S",
        type: "hat",
        stockCount: 8,
        price: 14.99
    }
}

const getBonnetWithBees = () => {
    return {
        name: "bonnet with bees",
        category: "child",
        gender: "female",
        size: "S",
        type: "hat",
        stockCount: 3,
        price: 19.99
    }
}

// Customer objects for testing
const getBilbo = () => {
    return {
        fullName: "Bilbo Baggins",
        email: "bilbo.baggins@shire.me",
        password: "peace-out-i'm-going-to-the-gray-havens"
    }
}

const getBilboNewEmail = () => {
    return {
        fullName: "Bilbo Baggins",
        email: "guest@rivendell.me",
        password: "peace-out-i'm-going-to-the-gray-havens"
    }
}

const getDrogo = () => {
    return {
        fullName: "Drogo Baggins",
        email: "drogo@shire.me",
        password: "frodo-I-am-your-father-:-)"
    }
}

const getBozo = () => {
    return {
        fullName: "Bozo Baggins",
        email: "bozo@shire.me",
        password: "just-a-clown-trying-to-make-a-living"
    }
}

const getLogo = () => {
    return {
        fullName: "Logo Baggins",
        email: "logo@shire.me",
        password: "swoosh-arches-apple-with-a-bite"
    }
}

const getPogo = () => {
    return {
        fullName: "Pogo Baggins",
        email: "pogo@shire.me",
        password: "boing-boing-boing=1982"
    }
}

const getHimbo = () => {
    return {
        fullName: "Himbo Baggins",
        email: "himbo@shire.me",
        password: "12345" 
    }
}

// Functions to create order objects for testing
const getOrderOne = () => {
    return {
        datePlaced: "2005-05-01",
        status: "pending",
        customerId: 1
    }
}

const getOrderTwo = () => {
    return {
        datePlaced: "2020-09-11",
        status: "awaiting fulfillment",
        customerId: 2
    }
}

const getOrderThree = () => {
    return {
        datePlaced: "2023-09-01",
        status: "shipped",
        customerId: 3
    }
}

const getOrderFour = () => {
    return {
        datePlaced: "2010-11-04",
        status: "cancelled",
        customerId: 4
    }
}

const getOrderFive = () => {
    return {
        datePlaced: "2008-11-06",
        status: "refunded",
        customerId: 5
    }
}

const getAnotherBilboOrder = () => {
    return {
        datePlaced: "2021-04-01",
        status: "shipped",
        customerId: 1
    }
}

const getYetAnotherBilboOrder = () => {
    return {
        datePlaced: "2022-06-01",
        status: "awaiting fulfillment",
        customerId: 1
    }
}

const getAnotherDrogoOrder = () => {
    return {
        datePlaced: "2000-05-01",
        status: "completed",
        customerId: 2
    }
}

const getAnotherLogoOrder = () => {
    return {
        datePlaced: "2001-05-05",
        status: "shipped",
        customerId: 4
    }
}

const getOrderOneCompleted = () => {
    return {
        datePlaced: "2005-05-01",
        status: "completed",
        customerId: 1
    }
}

module.exports = {
    getBallroomGown,
    getBigBallroomGown,
    getButtlessChaps,
    getBonnet,
    getBonnetWithBees,
    getButtfulChaps,
    getBilbo,
    getDrogo,
    getBozo,
    getLogo, 
    getPogo,
    getHimbo,
    getBilboNewEmail,
    getOrderOne,
    getOrderTwo,
    getOrderThree,
    getOrderFour,
    getOrderFive,
    getAnotherBilboOrder,
    getYetAnotherBilboOrder,
    getAnotherDrogoOrder,
    getAnotherLogoOrder,
    getOrderOneCompleted
}