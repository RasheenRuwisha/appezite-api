//Geneated the IDS for business, categories, products and skus

exports.generateID = function(type) {
    var businessId           = type;
    var allowedCharacters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var allowedCharactersLength = allowedCharacters.length;
    for ( var i = 0; i < 10; i++ ) {
        businessId += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharactersLength));
    }
    return businessId;
}
