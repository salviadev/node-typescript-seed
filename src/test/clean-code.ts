// Nom de variables
function nameOfVariables() {
    // DON'T
    let d
    let elapsed
    let arr = [{ firstName: 'Tony', age: 54 }]
    const ages = arr.map((i) => i.age)

    // DO
    let users = [{ firstName: 'Tony', age: 54 }]
    let daysSinceModification
    const agesOfUsers = users.map((user) => user.age)
}

// Nom de variables
function nameOfVariableNoExtraNouns() {
    // DON'T
    let nomChaine
    let lesUtilisateurs

    // DO
    let nom
    let utilisateurs
}

// Nom de variables
function nameOfVariablePronounce(cart: any) {
    // DON'T
    let fName, lName
    let cntr

    let full = false
    if (cart.size > 100) {
        full = true
    }

    // DO
    let firstName, lastName
    let counter

    const MAX_CART_SIZE = 100
    // ...
    const isFull = cart.size > MAX_CART_SIZE
}

// Nom des fonctions

// DON'T
/**
 * Invite a new user with its email address
 * @param {String} user email address
 */
function inv(user: string) { /* implementation */ }

// DO
function inviteUser(emailAddress: string) { /* implementation */ }



// Fonctions args.length

function getRegisteredUsersLongArgumentList(fields: string[], include: string[], fromDate: string, toDate: string) { /* implementation */ }
getRegisteredUsersLongArgumentList(['firstName', 'lastName', 'email'], ['invitedUsers'], '2016-09-26', '2016-12-13')

// DO
function getRegisteredUsers(arg: { fields: string[], include: string[], fromDate: string, toDate: string }) { /* implementation */ }
getRegisteredUsers({
    fields: ['firstName', 'lastName', 'email'],
    include: ['invitedUsers'],
    fromDate: '2016-09-26',
    toDate: '2016-12-13'
})


// Fonctions (order in file)
// DON'T
// "I need the full name for something..."
function _getFullName(user: any): string {
    return '${user.firstName} ${user.lastName}'
}

function _renderEmailTemplate(user: any): string {
    // "oh, here"
    const fullName = _getFullName(user)
    return 'Dear ${fullName}, ...'
}


// DO
function renderEmailTemplate(user: any): string {
    // "I need the full name of the user"
    const fullName = getFullName(user)
    return 'Dear ${fullName}, ...'
}

// "I use this for the email template rendering"
function getFullName(user: any): string {
    return '${user.firstName} ${user.lastName}'
}

