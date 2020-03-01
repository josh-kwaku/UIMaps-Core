require('dotenv').config();
const app = require('./components');
const port = process.env.PORT || 80;

app.listen(port, '', () => {
    console.log(`App Listening On Port ${port}`);
});
