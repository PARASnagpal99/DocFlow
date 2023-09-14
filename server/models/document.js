const mongoose = require('mongoose') ;

const docSchema = new mongoose.Schema({
    _id : String ,
    data : Object 
})

const Document = mongoose.model('Document',docSchema);
module.exports = Document ;