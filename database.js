
function initializeDb() {
	var config = {
        apiKey: "AIzaSyDUSIwpPgxrzim4lpnM0ATCRTsmC9lbzdk",
        authDomain: "classroomvideo-49965.firebaseapp.com",
        databaseURL: "https://classroomvideo-49965.firebaseio.com",
        projectId: "classroomvideo-49965",
        storageBucket: "classroomvideo-49965.appspot.com",
        messagingSenderId: "826703245914"
      };
    firebase.initializeApp(config);
}


function getAnnotationTable() {
	db.child('Annotations').child('videoURL').child('annotatorID').on("value", function(snapshot) {
    	console.log(snapshot.val());
    	snapshot.forEach(function(data) {
        	console.log(data.key);
    	});
	});
}

function addAnnotationToDb(videoURL, annotatorID, annotation, frame) {
	debugger;
	let annotationTable = firebase.database().ref().child('Annotations').child(videoURL).child(annotatorID).child("1");
	var newref = annotationTable.push();
  	newref.set({
    	"annotationID": newref.getKey(),
    	"x": 100,
    	"y": 100,
    	"width": 100,
    	"height": 100,
    	"tags": {
    		"Happy": true,
    		"Sad": false,
    		"Frustrated": false
    	}
  	});
	return 0;
}

