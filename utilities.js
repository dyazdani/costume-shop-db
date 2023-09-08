// *** FOR JEST TESTING ***

// Helper function for matching input objects with objects returned from DB queries
const matchesDatabase = (inputObject, databaseObject) => {
    let areAllPropertiesMatched = true;

    for (const prop in inputObject) {        
        // convert prop to snake case to match DB column name in query return
        let propForDatabaseObject = prop;

        if (prop.match(/[A-Z]/g) !== null) {
            const charArray = prop.split('');
            const finalCharArray = charArray.map(char => {
                if (char.match(/[A-Z]/g) !== null) {
                    return "_" + char.toLowerCase();
                }
                return char;
            })
            propForDatabaseObject = finalCharArray.join('');
        }

         // Account for PT to UTC adjustment in DB
        if (
                databaseObject[propForDatabaseObject] instanceof Date &&
                inputObject[prop] + 'T07:00:00.000Z' !== databaseObject[propForDatabaseObject].toISOString()
            ) {
                areAllPropertiesMatched = false;
                return areAllPropertiesMatched;
            }

        if (!(databaseObject[propForDatabaseObject] instanceof Date) &&
            inputObject[prop] !== databaseObject[propForDatabaseObject]) {
            areAllPropertiesMatched = false;
            return areAllPropertiesMatched;
        }
    }
    return areAllPropertiesMatched;
}




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

const getBonnetMissingArg = () => {
    return {
        name: "bonnet",
        category: "child",
        gender: "female",
        size: "S",
        type: "hat",
        stockCount: 8
    }
}

const getGownWithWrongType = () => {
    return {
        name: "big ballroom gown",
        category: "adult",
        gender: "female",
        size: "L",
        type: "dress",
        stockCount: 1,
        price: "One hundred dollars"
    }
}

const getGownWithWrongCategory = () => {
    return {
        name: "big ballroom gown",
        category: "adolescent",
        gender: "female",
        size: "L",
        type: "dress",
        stockCount: 1,
        price: 14.99
    }
}

const getGownWithLongSize = () => {
    return {
        name: "big ballroom gown",
        category: "adult",
        gender: "female",
        size: "XXXXXXXXXXXXXXL",
        type: "dress",
        stockCount: 1,
        price: 14.99
    }
}


// Customer objects for testing
const bilbo = {
    fullName: "Bilbo Baggins",
    email: "bilbo.baggins@shire.me",
    password: "peace-out-i'm-going-to-the-gray-havens"
}

const bilboNewEmail = {
    fullName: "Bilbo Baggins",
    email: "guest@rivendell.me",
    password: "peace-out-i'm-going-to-the-gray-havens"
}

const drogo = {
    fullName: "Drogo Baggins",
    email: "drogo@shire.me",
    password: "frodo-I-am-your-father-:-)"
}

const bozo = {
    fullName: "Bozo Baggins",
    email: "bozo@shire.me",
    password: "just-a-clown-trying-to-make-a-living"
}

const logo = {
    fullName: "Logo Baggins",
    email: "logo@shire.me",
    password: "swoosh-arches-apple-with-a-bite"
}

const pogo = {
    fullName: "Pogo Baggins",
    email: "pogo@shire.me",
    password: "boing-boing-boing=1982"
}

const bimbo = {
    fullName: "Bimbo Baggins",
    email: "bimbo@shire.me"
}

const bimboWrongEmail = {
    fullName: "Bimbo Baggins",
    email: "bimboshire.me",
    password: "12345"
}

const bimboNull = {
    fullName: "Bimbo Baggins",
    email: "bimbo@shire.me",
    password: null
}

const bimboLong = {
    fullName: "Bimbo Baggins",
    email: "bimbo@shire.me",
    password: "hobbits-are-sooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo-fat"
}


// Order objects for testing
const orderOne = {
    datePlaced: "2005-05-01",
    status: "pending",
    customerId: 1
}

const orderTwo = {
    datePlaced: "2020-09-11",
    status: "awaiting fulfillment",
    customerId: 2
}

const orderThree = {
    datePlaced: "2023-09-01",
    status: "shipped",
    customerId: 3
}

const orderFour = {
    datePlaced: "2010-11-04",
    status: "cancelled",
    customerId: 4
}

const orderFive = {
    datePlaced: "2008-11-06",
    status: "refunded",
    customerId: 5
}

const orderWithMissingArgs = {
    datePlaced: "2023-09-01",
    customerId: 3
}

const orderWithNull = {
    datePlaced: "2023-09-01",
    status: null,
    customerId: 3
}

const orderWithInvalidStatus = {
    datePlaced: "2023-09-01",
    status: "awaiting payment",
    customerId: 3
}

const anotherBilboOrder = {
    datePlaced: "2021-04-01",
    status: "shipped",
    customerId: 1
}

const yetAnotherBilboOrder = {
    datePlaced: "2022-06-01",
    status: "awaiting fulfillment",
    customerId: 1
}

const anotherDrogoOrder = {
    datePlaced: "2000-05-01",
    status: "completed",
    customerId: 2
}

const anotherLogoOrder = {
    datePlaced: "2001-05-05",
    status: "shipped",
    customerId: 4
}

const orderOneCompleted = {
    datePlaced: "2005-05-01",
    status: "completed",
    customerId: 1
}
module.exports = {
    matchesDatabase,
    getBallroomGown,
    getBigBallroomGown,
    getButtlessChaps,
    getBonnet,
    getBonnetWithBees,
    getButtfulChaps,
    getBonnetMissingArg,
    getGownWithWrongType,
    getGownWithWrongCategory, 
    getGownWithLongSize,
    bilbo,
    drogo,
    bozo,
    logo, 
    pogo,
    bimbo,
    bimboWrongEmail,
    bimboNull,
    bimboLong,
    bilboNewEmail,
    orderOne,
    orderTwo,
    orderThree,
    orderFour,
    orderFive,
    orderWithMissingArgs,
    orderWithNull,
    orderWithInvalidStatus,
    anotherBilboOrder,
    yetAnotherBilboOrder,
    anotherDrogoOrder,
    anotherLogoOrder,
    orderOneCompleted
}