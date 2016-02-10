var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var express = require('express');
var app = express();

//connect to database
mongoose.connect('mongodb://localhost/urlshortner');
var UrlModel = mongoose.model('URL', new Schema({
	id: ObjectId,
	countId: Number,
	originalUrl: String,
	shortUrl: String,
}));

app.use(express.static(__dirname+'/WebContent'));

app.get(/^\/new\/([a-zA-Z0-9\/:.]*)$/, function(req, res){
	var regex = /(http|https):\/\/[A-Za-z0-9\.-]{3,}\.[A-Za-z]{2,}$/;
	var url = req.params[0];
	if(!regex.test(url)){
		res.json({error: 'Invalid URL'});
	} else {
		UrlModel.count(function(err, count){
			if(err) return err;
			
			var shortUrl = req.protocol + "://" + req.get('host') + "/" + (++count);

			var newEntry = new UrlModel({
				originalUrl: url,
				shortUrl: shortUrl,
				countId: count
			});
			
			newEntry.save(newEntry, function(err, data){
				res.json({originalUrl: url, shorterUrl: data.shortUrl});
			});
		});
	}
});

app.get('/:id', function(req, res){
	var id = req.params.id;
	
	UrlModel.findOne({countId: id}, function(err, urlModel){
		if(urlModel){
			res.redirect(urlModel.originalUrl);
		} else {
			res.json({error: 'No URL found'});
		}
	});
});

app.listen(8080);
