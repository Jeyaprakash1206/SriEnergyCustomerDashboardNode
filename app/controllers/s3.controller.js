const AWS = require('aws-sdk');
var stream = require('stream');
var mysql = require('mysql')
var fs = require('fs');
var connection = mysql.createConnection({
	host: '', //db IP
	user: '',// db username
	password: '', //db password
	database: '' // db database eg) s3
})
const s3 = require('../config/s3.config.js');

exports.doDownload = (req, res) => {
	const s3Client = new AWS.S3({
		accessKeyId: req.body.accesskey,
		secretAccessKey: req.body.secretaccesskey,
		region: req.body.region
	});
	var params = {
		Bucket: req.body.bucket,
		Key: req.body.prefix.replace(/\u00A0/g, " "),
	}

	//params.Key = req.params.filename;
	//res.attachment(params.Key);
	s3Client.getObject(params)
		.createReadStream()
		.on('error', function (err) {
			res.status(500).json({ error: "Error -> " + err });
		}).pipe(res);
};
exports.downloadFolder = (req, res) => {
	const s3Client = s3.s3Client;
	const params = {
		Bucket: 'databook1',
		Prefix: 'Ensco/ 10129-0000008108- SRI-614004 (S19-040)/', // pass key
	};
	fs.exists(params.Prefix, function (exists) {
		if (!exists) {
			fs.mkdirSync(params.Prefix);
		}
	});

	// Go!
	s3Client.listObjects(params, function (err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else {

			console.log(data.Contents.length + " files found in '" + params.Prefix + "' bucket");

			data.Contents.forEach(function (currentValue, index, array) {

				// Check if the file already exists?
				fs.exists(params.Prefix + "/" + currentValue.Key, function (exists) {

					if (exists) {
						console.log("Skipping: " + currentValue.Key);
					}
					else {
						console.log("Retrieving: " + currentValue.Key);
						s3Client.getObject({ Bucket: params.Bucket, Key: currentValue.Key }, function (err, data) {
							if (err) console.log(err, err.stack); // an error occurred
							else {

								fs.writeFile(params.Prefix + "/" + currentValue.Key, data.Body, function () {
									console.log("Finished: " + currentValue.Key);
								});

							}
						});

					}

				});

			});

		}
	});
}
exports.allfiles = (req, res) => {
	try {
		const s3Client = new AWS.S3({
			accessKeyId: req.body.accesskey,
			secretAccessKey: req.body.secretaccesskey,
			region: req.body.region
		});;
		//const params = s3.downloadParams;

		//	params.Key = 'Ensco/';
		// var params = {
		// 	Bucket: req.body.bucket, /* required */
		// 	Prefix: req.body.prefix  // Can be your folder name
		// };
		// var params = {
		// 	Bucket: 'databook1',
		// 	Prefix: 'Ensco/PO # 10054-0000276265- ENSCO 121- S18-087/SSX 3015H-HBP1 (S18-087-004 TO 006)/', // pass key
		// }
		var params = {
			Bucket: req.body.bucket,
			Prefix: req.body.prefix.replace(/\u00A0/g, " "),
		}
		s3Client.listObjectsV2(params, function (err, data) {
			if (err) {
				res.send({ "error": err.message });
			}// an error occurred
			else {
				const result = data.Contents.filter(word => word.Key[word.Key.length - 1] != "/");
				result.forEach(function (e) { e.displayname = (e.Key.replace(params.Prefix, "").replace("/", "").replace(" ", "&nbsp;")) });
				res.send({ "response": result });           // successful response
			}
		});
	} catch (e) {
		res.send({ "error": e.message })
	}
};
exports.listdirectories = (req, res) => {
	try {
		const s3Client = new AWS.S3({
			accessKeyId: req.body.accesskey,
			secretAccessKey: req.body.secretaccesskey,
			region: req.body.region
		});;
		//const params = s3.downloadParams;

		//	params.Key = 'Ensco/';
		// var params = {
		// 	Bucket: req.body.bucket, /* required */
		// 	Prefix: req.body.prefix  // Can be your folder name
		// };
		// var params = {
		// 	Bucket: 'databook1',
		// 	Prefix: 'Ensco/PO # 10054-0000276265- ENSCO 121- S18-087/SSX 3015H-HBP1 (S18-087-004 TO 006)/', // pass key
		// }
		var params = {
			Bucket: req.body.bucket,
			Prefix: req.body.prefix.replace(/\u00A0/g, " "),
		}
		s3Client.listObjectsV2(params, function (err, data) {
			if (err) {
				res.send({ "error": err.message });
			}// an error occurred
			else {
				const result = data.Contents.filter(word => word.Key.length > params.Prefix.length && ((word.Key.replace(params.Prefix, "").split("/")).length == 1 || ((word.Key.replace(params.Prefix, "").split("/")).length == 2 && (word.Key.replace(params.Prefix, "").split("/"))[1].trim() == "")));
				result.forEach(function (e) { e.displayname = (e.Key.replace(params.Prefix, "").replace("/", "").replace(" ", "&nbsp;")) });
				res.send({ "response": result });           // successful response
			}
		});
	} catch (e) {
		res.send({ "error": e.message })
	}
};
exports.login = (req, res) => {
	//connection.connect()

	try {
		connection.query(`select * from users where username ='` + req.body.username + `' and password = '` + req.body.password + `'`, function (err, rows, fields) {
			if (err) throw err

			res.send({
				"result": rows[0]
			})
		})
	} catch (e) {
		res.send("error", e.message)
	}

	//connection.end()
};