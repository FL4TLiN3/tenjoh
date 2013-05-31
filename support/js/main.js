var tenjoh = require('tenjoh'),
    app = tenjoh();

app.use(function(req, res, next) {
    console.log(req.url);
    next();
});

app.set('view engine', 'swag');
app.set('view', 'view/');
