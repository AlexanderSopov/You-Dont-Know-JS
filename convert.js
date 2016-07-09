"use strict";
var mkdirp = require('mkdirp');
var fs = require('fs');
var getDirName = require('path').dirname;
var pandoc = require('pdc');
var async = require('async');
var count = 0;
var folderRegex = /^.[^.]+$/;
var mdRegex = /\.md$/;
/*
	fs.readdir("./", function(err, files){

		//console.log(files);

		for(let i in files){
			//console.log(files[i]);
		}

		for (let i = 0; i<files.length; i++)
			//console.log(files[i]);

		var hej = ["hej","då","min vän"];

		for(let i in hej)
			//console.log(hej[i]);
	});
*/

function Converter(){

	function searchDir(path){
		async.waterfall([
			
			function(next){
				next(null, path)
			},

			function readDir(path, next){
				//console.log("at readDir, path = " + path);
				fs.readdir(path, function(err, files){
					if (err){
						//console.log(err);
						return //kill proccess, might have been a weird file
					}
						next(null, path, files);
				});
			},

			function identifyFiles(path, files, next){
				//console.log("at identifyFiles, path = " + path);
				for(let i in files){
					let file = files[i];
					if (folderRegex.test(file))
						searchDir((path + file + "/"));
					else if (mdRegex.test(file))
						setTimeout(function(){
							convert((path+file), file)
						}, 500*count++);
				}
			}
	
		], function(err, data){
			if (err)
				return ;//console.log(err);
		});
	
	}

	function convert(path){
		async.waterfall([
			function(next){
				next(null, path);
			},
			function readFile(path, next){
				//console.log("at readFile, path = " + path);
				fs.readFile(path, "utf-8", function(err, txt){
					next(err, path, txt);
				});
			},

			function convertFile(path, txt, next){
				//console.log("at convertFile, txt = " + txt);
				pandoc(txt, "markdown", 'html', function(err, outp){
					if(err)
						console.log("Error at pandoc: " + err.stack);
					next(err, path, outp);
				})
			},

			function saveFile(path, output, next){
				console.log("at saveFile, path = " + path);
				var newPath = "./epub/" + path.substring(2, path.length-2) + "html";
				mkdirp(getDirName(newPath), function(err){
					if (err){
						//console.log("error at making dir");
						return next(err);
					}fs.writeFile(newPath, output, next)	
				})
			}

			], function(err, data){
				if(err){
					console.log(err);
				}
			});
	}


	var API = {
		searchDirectory: searchDir,
		convert: convert
	}


	return API;

}



var run = Converter();


run.searchDirectory("./");