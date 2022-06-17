const checkPermission = (user, entity, action) => {
    return user.permissions[entity][action];
}

module.exports = {checkPermission};