const cors = require("cors");
const express = require("express");
const expressUserAgent = require("express-useragent");
const helmet = require("helmet");
const mongoose = require("mongoose");
const morgan = require("morgan");

const keys = require("./config/keys");

const userAuthV1Routes = require("./routes/v1/user/authentication");
const userProductV1Routes = require("./routes/v1/user/products");
const userShopV1Routes = require("./routes/v1/user/shops");

mongoose.connect(keys.mongoDBURI).then(value => {
    console.log(`Connected to MongoDB on database ${value.connection.db.databaseName}`);
}).catch(error => {
    console.log(`Error: ${error.message}`);
});

const app = express();

app.use(cors({origin: '*', 'Access-Control-Allow-Origin': "*"}));
app.use(helmet())
app.use(express.json({limit: '5MB'}));
app.use(expressUserAgent.express());
app.use(morgan("dev"));


app.use('/api/v1/user/auth', userAuthV1Routes);
app.use('/api/v1/user/products', userProductV1Routes);
app.use('/api/v1/user/shops', userShopV1Routes);

const port = process.env.PORT || keys.port;

app.listen(port, () => {
    console.log(`Server connected in ${keys.nodeENV} mode on port ${port}`);
});