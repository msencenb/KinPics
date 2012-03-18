
/**
 * Module dependencies.
 * This requires postgres + npm install pg
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer(), io = require('socket.io').listen(app);
//io.disable('destroy upgrade');
io.set('log level',2);

var current_user = 0;
var quadrant1;
var quadrant2;
var quadrant3;
var quadrant4;
var last_url;
var current_desktop = 1;
// Configuration

var master_socket;
var slave_socket;
var master_ip;
var slave_ip;
var active_socket;
var active_ip;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser({uploadDir:'./uploads'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

//postgresql
var pg = require('pg'); 

var conString = "postgres://nodeuser:@localhost/nodephotos";
var client = new pg.Client(conString);
client.connect();

//Require for moving images
var fs = require('fs');



// Routes


app.get('/testroute', function(req,res){
	res.render('test',{ title: 'testing' });
});



app.get('/user/:id/photos', function(req, res) {
    var query = client.query("SELECT * from photos where user_id="+req.params.id);
	query.on('row', function(row) {
	    console.log('image is at "%s"', row.url);
	 });
	res.send('good');
});

function switchMasterIP(){
	//console.log('**** switchmasterip *****');
	//console.log("master ip = "+master_ip + " active ip = "+ active_ip);
	if(master_ip == active_ip){
		active_ip = slave_ip;
	//	console.log("master ip = "+master_ip + "and new active ip = "+ active_ip);
		//active_socket = slave_socket;
	} else {
		active_ip = master_ip;
	//	console.log("master ip = "+master_ip + "and new active ip = "+ active_ip);
		//active_socket = master_socket;
	}
}

function displayPhotoDesk() {
	if (current_desktop == 1){
		var photoArray1 = new Array();
		var query1 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=42 and photo_id = photos.id order by photos.id DESC limit 10");
		var photoArray2 = new Array();
		quadrant1 = 41;
		var query2 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=43 and photo_id = photos.id order by photos.id DESC limit 10");
		var photoArray3 = new Array();
		quadrant2 = 39;
		var query3 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=44 and photo_id = photos.id order by photos.id DESC limit 10");
		var photoArray4 = new Array();
		quadrant3 = 38;
		var query4 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=45 and photo_id = photos.id order by photos.id DESC limit 10");
		quadrant4 = 40;
		query1.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray1.push(temp);
		});
		query1.on('end', function() { 
			//console.log('query1');
		    io.sockets.emit('quadrant1', photoArray1);
		});
		query2.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray2.push(temp);
		});
		query2.on('end', function() { 
			//console.log('query2');
		    io.sockets.emit('quadrant2', photoArray2);
		});
		query3.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray3.push(temp);
		});
		query3.on('end', function() { 
		//	console.log('query3');
		    io.sockets.emit('quadrant3', photoArray3);
		});
		query4.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray4.push(temp);
		});
		query4.on('end', function() { 
		//	console.log('query4');
		    io.sockets.emit('quadrant4', photoArray4);
		});
	} else {
		var photoArray1 = new Array();
		var query1 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=38 and photo_id = photos.id order by photos.id DESC limit 10");
		var photoArray2 = new Array();
		quadrant1 = 41;
		var query2 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=39 and photo_id = photos.id order by photos.id DESC limit 10");
		var photoArray3 = new Array();
		quadrant2 = 39;
		var query3 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=40 and photo_id = photos.id order by photos.id DESC limit 10");
		var photoArray4 = new Array();
		quadrant3 = 38;
		var query4 = client.query("SELECT url, orientation from photos, tag_line_items where tag_id=41 and photo_id = photos.id order by photos.id DESC limit 10");
		quadrant4 = 40;
		query1.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray1.push(temp);
		});
		query1.on('end', function() { 
			//console.log('query1');
		    io.sockets.emit('quadrant1', photoArray1);
		});
		query2.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray2.push(temp);
		});
		query2.on('end', function() { 
			//console.log('query2');
		    io.sockets.emit('quadrant2', photoArray2);
		});
		query3.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray3.push(temp);
		});
		query3.on('end', function() { 
		//	console.log('query3');
		    io.sockets.emit('quadrant3', photoArray3);
		});
		query4.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray4.push(temp);
		});
		query4.on('end', function() { 
		//	console.log('query4');
		    io.sockets.emit('quadrant4', photoArray4);
		});	
	}
}

function checkActiveIP(req){
	/*console.log('****** active ip check *****');
	console.log("req ip = "+req.connection.remoteAddress);
	console.log("active = "+ active_ip);*/
	
	if (req.connection.remoteAddress == active_ip) {
		//console.log("return true from checkactiveip");
		return true;
	} else {
		//console.log("return fasle from checkactiveip");
		return false;
	}
}


function insertTagLineItems(req, photo_id){
	var tagArray = req.body.tags.split(" ");
	for(var i = 0; i < tagArray.length; i++){
		var queryConfig = {
			text: 'SELECT id from tags where title=$1',
	    	values: [tagArray[i]]
	  	};
		client.query(queryConfig, function(err,result){
			var rowid = result.rows[0].id;
			client.query("INSERT into tag_line_items (tag_id,photo_id) VALUES ('"+rowid+"','"+photo_id+"')", function(err,result){
				console.log(err);
				console.log(result);
				//assumes only 1 tag uploaded
				io.sockets.emit('notification', 'New Photo Uploaded!');
			});
		});
	}

}


function insertTags(req,photo_id){
	var tagArray = req.body.tags.split(" ");
	for(var i = 0; i < tagArray.length; i++){
		
		var queryConfig = {
			text: 'INSERT into tags(title) VALUES($1) EXCEPT select title from tags where title=$1',
	    	//text: 'SELECT id, title FROM tags WHERE title = $1',
	    	values: [tagArray[i]]
	  	};
		client.query(queryConfig, function(err, result){
		});
	}
}

app.post('/user/:id/photos', function(req, res) {
	  // get the temporary location of the file
	var large_path = req.files.large_picture.path;
	var large_target = './public/images/' + req.body.filename + 'large.jpg';
	fs.rename(large_path, large_target, function(err) {
        if (err) throw err;

        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(large_path, function() {
            if (err) throw err;
        });
    });
	var small_path = req.files.small_picture.path;
	var small_target = './public/images/' + req.body.filename + 'thumbnail.jpg';
	fs.rename(small_path, small_target, function(err) {
        if (err) throw err;

        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(small_path, function() {
            if (err) throw err;
        });
    });
    var tmp_path = req.files.picture.path;
    // set where the file should actually exists - in this case it is in the "images" directory
    var target_path = './public/images/' + req.body.filename + '.jpg';

    // move the file from the temporary location to the intended location
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;

        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        fs.unlink(tmp_path, function() {
            if (err) throw err;
        });
    });

	var photo_id = 0;
	//Now need to add record into db
	client.query("INSERT into photos (url, orientation) VALUES('"+ target_path +"','h') RETURNING id", function(err, result){
		photo_id = result.rows[0].id
		client.query("INSERT into photo_line_items (user_id, photo_id) VALUES ('"+req.params.id+"', '"+photo_id+"')", function(err, result){
		});
		client.query("INSERT into ratings (photo_id) VALUES ('"+photo_id+"')", function(err,result){
		});
		//Have to add new tags and make line items between tags and photos
		insertTags(req,photo_id);
		//This is subject to race conditions... fuck
		insertTagLineItems(req,photo_id);
	});
	//Also need to handle tagging

	res.send('File uploaded to: ' + target_path + ' - ' + req.files.picture.size + ' bytes');
});

app.get('/handposition/:leftx/:lefty/:leftv/:rightx/:righty/:rightv',function(req,res){
	if (checkActiveIP(req)) {
		var temp = new Object();
		temp.right_x = req.params.rightx;
		temp.right_y = req.params.righty;
		temp.left_x = req.params.leftx;
		temp.left_y = req.params.lefty;
		temp.right_opacity = req.params.leftv;
		temp.left_opacity = req.params.rightv;
		io.sockets.emit('position', temp);
		res.send('position');
	} else {
		res.send('not in control');
	};
});

app.get('/usericon/gray', function(req,res){
	io.sockets.emit('gray');
	res.send('gray');
});

app.get('/usericon/green', function(req,res){
	io.sockets.emit('green');
	res.send('green');
});

app.get('/usericon/none', function(req,res){
	io.sockets.emit('none');
	res.send('none');
});

app.get('/rating/finish', function(req,res){
	if (checkActiveIP(req)) {
		//I would like to get the rating currently displayed back from client so I can save to db
		io.sockets.emit('ratingfinish');
		last_url = req.url;
		res.send('rating');
	} else {
		res.send('not in control');
	};
});

app.get('/rating/:id', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('ratingchange', parseInt(req.params.id)/2);
		last_url = req.url;
		res.send('rating');
	} else {
		res.send('not in control');
	};
});

app.get('/rating', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('rating');
		last_url = req.url;
		res.send('rating');
	} else {
		res.send('not in control');
	};
});

app.get('/browsing/scrollleft/:amount', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('browsing/scrollleft', req.params.amount);
		last_url = req.url;
		res.send('browse scrollleft');
	} else {
		res.send('not in control');
	};
});

app.get('/browsing/scrollright/:amount', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('browsing/scrollright', req.params.amount);
		last_url = req.url;
		res.send('browse scrollright');
	} else {
		res.send('not in control');
	};
});

app.get('/browsing/:quad', function(req,res){
	if (checkActiveIP(req)) {
		var photoArray1 = new Array();
		var tag_id = 1;
		console.log(req.params.quad);
		switch(parseInt(req.params.quad))
		{
			case 1:
				if (current_desktop == 1) {
					tag_id = 42;
				} else {
					tag_id = 38;
				}
				break;
			case 2:
				if (current_desktop == 1) {
					tag_id= 43;
				} else {
					tag_id = 39;
				}
				break;
			case 3:
				if (current_desktop == 1) {
					tag_id = 44;
				} else {
					tag_id = 40;
				}
				break;
			case 4:
				if (current_desktop == 1) {
					tag_id= 45;
				} else {
					tag_id = 41;
				}
				break;
			default:
				console.log('defualt');
				tag_id = 1;
		}
		console.log(tag_id);
		var query1 = client.query("SELECT photos.id, url, orientation,rating  from photos, tag_line_items, ratings where tag_id="+tag_id+" and tag_line_items.photo_id = photos.id and ratings.photo_id = photos.id");
		query1.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation;
			temp.id = row.id;
			temp.rating = row.rating;
			photoArray1.push(temp);
		});
		query1.on('end', function() { 
			//console.log('query1');
		    io.sockets.emit('browsing', photoArray1);
		});
		last_url = req.url;
		res.send('browse quadrant');
	} else {
		res.send('not in control');
	};
});

app.get('/photodesk/scrollleft', function(req,res){
	if (checkActiveIP(req)) {
		if (current_desktop == 1){
			current_desktop = 2;
		} else {
			current_desktop = 1;
		}
		displayPhotoDesk();
		io.sockets.emit('photodesk/swipeleft');
		last_url = req.url;
		res.send('swipeleft');
	} else {
		res.send('not in control');
	};
});

app.get('/photodesk/scrollright', function(req,res){
	if (checkActiveIP(req)) {
		if (current_desktop == 1){
			current_desktop = 2;
		} else {
			current_desktop = 1;
		}
		io.sockets.emit('photodesk/swiperight');
		displayPhotoDesk();
		last_url = req.url;
		res.send('swiperight - swiperight');
	} else {
		res.send('not in control');
	};
});

app.get('/photodesk/hover/:quad', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('hover', req.params.quad);
		last_url = req.url;
		res.send('hover');
	} else {
		res.send('not in control');
	};
});

app.get('/photodesk', function(req,res){
	//Need to know which user I have here
	//I need 4 quadrangs of 4 different tags.
	// select photo urls where tag_id = 
	// select if
	//console.log('outside photodesk ip check');
	if (checkActiveIP(req)) {
		io.sockets.emit('photodesk');
		displayPhotoDesk();
	//	console.log('inside photodesk');
		//client.query("SELECT url, title from photos,tags, tag_line_items where tag_line_items.photo_id AND tag_line_items.tag_id = 38")
		last_url = req.url;
		res.send('photodesk');
	} else {
		res.send('not in control');
	};
});

app.get('/identified/:id', function(req,res){
	if (checkActiveIP(req)) {
		var photo_url = "";
		var name = "";
		client.query("SELECT url, name from photos,users where profile_photo_id=photos.id AND users.id="+req.params.id, function(err,result){
			photo_url = result.rows[0].url;
			name = result.rows[0].name;
			io.sockets.emit('identified', {user: {name: name, photo: photo_url}});
			current_user = req.params.id;
		});
		last_url = req.url;
		res.send('identified');
	} else {
		res.send('not in control');
	};
});

app.get('/identifying', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('identifying');
		last_url = req.url;
		res.send('identifying');
	} else {
		res.send('not in control');
	};
});

app.get('/idle', function(req,res){
//	console.log('idle hit');
	if (checkActiveIP(req)) {
		var photoArray = new Array();
		var query = client.query("SELECT url, orientation from photos order by random() limit 15");
		query.on('row', function(row){
			var temp = new Object();
			temp.url = row.url;
			temp.orientation = row.orientation
			photoArray.push(temp);
		});
		query.on('end', function() { 
			//client.end();
		    io.sockets.emit('idle', {photos:photoArray});
		});
		//console.log("req data:");
	//	console.log(req.connection.remoteAddress);
		//console.log(res);
		//console.log(req);
		current_url = "idle";
		last_url = req.url;
		res.send('idle');
	} else {
		res.send('not in control');
	};
});

app.get('/zoomout', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('zoomout');
		last_url = req.url;
		res.send('zoomout');
	} else {
		res.send('not in control');
	};
});

app.get('/zoomin/scrollleft', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('browsing/scrollleft', 1);
		last_url = req.url;
		res.send('zoomin scrollleft');
	} else {
		res.send('not in control');
	};
});

app.get('/zoomin/scrollright', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('browsing/scrollright', 1);
		last_url = req.url;
		res.send('zoomin scrollright');
	} else {
		res.send('not in control');
	};
});

app.get('/zoomin', function(req,res){
	if (checkActiveIP(req)) {
		io.sockets.emit('zoomin');
		last_url = req.url;
		res.send('zoomin');
	} else {
		res.send('not in control');
	};
});

app.get('/refresh', function(req,res){
		last_url = req.url;
		//console.log('refresh hit');
		io.sockets.emit('refresh');
		res.send('refresh');
});

app.get('/tylerrefresh', function(req,res){
	io.sockets.emit('refresh');
	res.send('tylers special place');
});

app.get('/yield', function(req,res){
	console.log('****controlchange url hit****');
	if (checkActiveIP(req)) {
		console.log('** in control switched **');
		switchMasterIP();
		io.sockets.emit('notification', 'Control Changed');
		res.send('controlhit');
	} else {
		res.send('not in control');
		console.log('** not in control switch **');
	}
});

app.get('/master', function(req,res){
	console.log('***master button hit ****');
	console.log("req ip = "+ req.connection.remoteAddress);
	console.log("old master_ip = "+master_ip);
	master_ip = req.connection.remoteAddress;
	console.log("new master_ip = "+master_ip);
	active_ip = master_ip;
	console.log("active_ip = "+active_ip);
	res.send('master');
});

app.get('/slave', function(req,res){
	console.log('***** slave button hit****');
	console.log("old slave is = " +slave_ip);
	slave_ip = req.connection.remoteAddress;
	console.log("new slave is = "+slave_ip);
	console.log("active _ip is = " +active_ip);
	res.send('slave');
});

app.get('/poll', function(req,res){
	//master or slave, last url
	if(master_ip == active_ip) {
		res.send('master,'+last_url);
		//console.log('poll master');
	} else {
		res.send('slave,'+last_url);
		//console.log('poll slave');
	}
});

app.post('/user', function(req,res){
	//New user creation
	client.query("INSERT into users (name) VALUES ('"+req.body.name+"')", function(err, result) {
  	});
	res.send(req.body.name);
});

app.get('/', routes.index);

io.sockets.on('connection', function(socket) {
	socket.emit('news', {hello:'world'});
	console.log('socket connected');
	//console.log(socket);
	var address = socket.handshake.address;
	console.log("new connection from "+ address.address);
	socket.on('lastrating', function(data){
		console.log('inside last rating - id and rating');
		console.log(data);
		client.query("UPDATE ratings set rating ="+data.rating+" where photo_id ="+data.id);
	});
	socket.on('changecontrol', function(data){
		console.log("socket switch control");
		switchMasterIP();
	});
	socket.on('master', function(data){
		master_socket = socket;
	});
	socket.on('slave', function(data){
		slave_socket = socket;
	});
	socket.on('helloserver', function(data){
		console.log("hello server hit");
	});
	socket.on('message', function(data){
		console.log(data);
	})
});


app.listen(3780);
//So now in each route we can just use socket.emit correct?
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
