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

        if (inputObject[prop] !== databaseObject[propForDatabaseObject]) {
            areAllPropertiesMatched = false;
            return areAllPropertiesMatched;
        }
    }
    return areAllPropertiesMatched;
}


// Costume objects for testing
const ballroomGown = {
    name: "ballroom gown",
    category: "adult",
    gender: "female",
    size: "L",
    type: "dress",
    stockCount: 1,
    price: 150.99
}

const bigBallroomGown = {
    name: "big ballroom gown",
    category: "adult",
    gender: "female",
    size: "L",
    type: "dress",
    stockCount: 1,
    price: 150.99
}

const buttlessChaps = {
    name: "buttless chaps",
    category: "adult",
    gender: "unisex",
    size: "M",
    type: "pants",
    stockCount: 3,
    price: 75.99
}

const bonnet = {
    name: "bonnet",
    category: "child",
    gender: "female",
    size: "S",
    type: "hat",
    stockCount: 8,
    price: 14.99
}

const bonnetMissingArg = {
    name: "bonnet",
    category: "child",
    gender: "female",
    size: "S",
    type: "hat",
    stockCount: 8
}

const gownWithWrongType = {
    name: "big ballroom gown",
    category: "adult",
    gender: "female",
    size: "L",
    type: "dress",
    stockCount: 1,
    price: "One hundred dollars"
}

const gownWithWrongCategory = {
    name: "big ballroom gown",
    category: "adolescent",
    gender: "female",
    size: "L",
    type: "dress",
    stockCount: 1,
    price: 14.99
}

const gownWithLongSize = {
    name: "big ballroom gown",
    category: "adult",
    gender: "female",
    size: "XXXXXXXXXXXXXXL",
    type: "dress",
    stockCount: 1,
    price: 14.99
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


module.exports = {
    matchesDatabase,
    ballroomGown,
    bigBallroomGown,
    buttlessChaps,
    bonnet,
    bonnetMissingArg,
    gownWithWrongType,
    gownWithWrongCategory, 
    gownWithLongSize,
    bilbo,
    drogo,
    bozo,
    bimbo,
    bimboWrongEmail,
    bimboNull,
    bimboLong,
    bilboNewEmail
}