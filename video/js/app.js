'use strict';

var db;

window.onload = function() {
	//db = new PouchDB('videoLibrary');
    db = new PouchDB('http://admin:admin@127.0.0.1:5984/videolibrary_couch');
    
    /*var remoteDB = 'http://admin:admin@127.0.0.1:5984/videolibrary_couch';
    db.sync(remoteDB, {
      live: true
    }).on('change', function (change) {
      console.log("yo, something changed!");
    }).on('paused', function (info) {
      console.log("replication was paused, usually because of a lost connection");
    }).on('active', function (info) {
      console.log("replication was resumed");
    }).on('error', function (err) {
        console.log(err);
      console.log("totally unhandled error (shouldn't happen)");
    });*/
    
};

function uploadVideo(){
    var student_name = $("#student_name").val();
    console.log("uploadVideo for : " + student_name);
    
    db.get(student_name).catch(function (err) {
        if (err.status === 404) { // not found!
            var student_info = {
                _id: student_name,
                type: 'student'
            };
            db.put(student_info);
            return db.get(student_name);
        } else { // hm, some other error
            throw err;
        }
    }).then(function (studentDoc) {
        // sweet, here is our studentDoc
        console.log("Student Info : ");
        console.log(studentDoc);
        
        var file = document.getElementById('inputFile').files[0];
        if (file) {
            console.log(file);
            db.putAttachment(student_name, file.name, studentDoc._rev, file, file.type).then(function(){
                alert("Uploaded successfully...");
            }).catch(function(err){
                console.log(err);
            });
        }
        
    }).catch(function (err) {
        // handle any errors
        console.error(err);
    });
}

function fetchExistingVideos(){
    var student_name = $("#student_name").val();
    console.log(student_name);
    if(student_name.length === 0){
        alert("Enter Student Name");
        return;
    }
    db.get(student_name).catch(function (err) {
        if (err.status === 404) { // not found!
            console.log("No such student info found!!!");
            return;
        } else { // hm, some other error
            throw err;
        }
    }).then(function (studentDoc) {        
        db.bulkGet({
                docs: [ { id: studentDoc._id, rev: studentDoc._rev} ],
                attachments: true,
                binary: true
        }).then(function (response) {
            console.log("Here are existing info : ");            
            console.log(response);
            var my_results = response.results;
            //console.log(my_results);
            for (var i = 0, resultsLen = my_results.length; i < resultsLen; i++){
                var docs = my_results[i].docs;
                //console.log(docs);
                for (var j = 0, docsLen = docs.length; j < docsLen; j++){
                    var info = (docs[j].ok);
                    if(info._attachments){
                        $("#videoLibraryId").html("<i>Existing Assignment Videos</i><br>");
                        //console.log(info._attachments);
                        var videos = info._attachments;
                        for(var key in info._attachments){
                            db.getAttachment(info._id,key).then(function (blob){
                            var url = URL.createObjectURL(blob);
                            console.log(url);
                            console.log(blob);
                            var video = document.createElement('video');
                            video.width = 200;
                            video.height = 200;
                            video.setAttribute("controls","controls");
                            
                            var source = document.createElement('source');
                            source.src = url;
                            source.type = blob.type;
                            video.appendChild(source);
                            $("#videoLibraryId").append(video);
                            });
                        }
                    }else{
                        $("#videoLibraryId").html("<i>No video attachments available</i>");
                        console.log("No video attachments available");
                    }
                }
            }
        }).catch(function (err) {
            console.log(err);
        });
    });
    

}