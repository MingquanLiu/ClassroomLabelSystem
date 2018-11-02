
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

function addAnnotationToDb(videoURL, annotatorID, annotation, frame) {
	debugger;
	let annotationTable = firebase.database().ref().child('Annotations').child(videoURL).child(annotatorID).child("1");
	var newref = annotationTable.push();
  	newref.set(newref.getKey(): {
    	"top": annotation.top,
    	"left": annotation.left,
    	"width": annotation.width,
    	"height": annotation.height,
    	"emotions": annotation.emotions
  	});
}

<<<<<<< HEAD
function deleteAnnotationFromDb(videoURL, annotatorID, annotation, frame) {
    let annotationTable = firebase.database().ref().child('Annotations').child(videoURL).child(annotatorID).child("2");
    annotationTable.child(annotation.annotationID).remove();
}

function updateAnnotationPositionInDb(videoURL, annotatorID, annotation, frame) {
    debugger;
    let updates = {};
    let updateData = {
        "top": annotation.top,
        "left": annotation.left,
        "width": annotation.width,
        "height": annotation.height,
        "emotions": annotation.emotions
    };
    updates['/Annotations/'+videoURL+'/'+annotatorID+'/'+frame.toString()+'/'+annotation.annotationID] = updateData;
    firebase.database().ref().update(updates);
}

function updateAnnotationUsernameInDb(videoURL, annotatorID, annotation, frame) {
    return 0;
}

function dbToUITransform(annotation, xRatio, yRatio){ // XY ratio are currentX/originalX
	let top = annotation.top
	let left = annotation.left
	let width = annotation.width
	let height = annotation.height
    let annotationHtml = jQuery('<div/>', {
        class: 'annotation',
    });
	top = top * yRatio
	left = left * xRatio
	width = width * xRatio
	height = height * yRatio

    annotationHtml.css("top", top+'px');
    annotationHtml.css("left", left+'px');
    annotationHtml.css("width", width+'px');
    annotationHtml.css("height", height+'px');
    annotation.html = annotationHtml
    return annotation
}

function UITodbTransform(annotation, xRatio, yRatio){ // XY ratio are currentX/originalX
	let annotationHtml = annotation.html
    let top = parseInt(annotationHtml.css('top'),10)
    let left = parseInt(annotationHtml.css('left'),10)
    let width = parseInt(annotationHtml.css('width'),10)
    let height = parseInt(annotationHtml.css('height'),10)
    top = top / yRatio
    left = left / xRatio
    width = width / xRatio
    height = height / yRatio
	annotation.setDBValues(top, left, width, height)

    return annotation
}
