
function initializeDb(videoID, annotatorID, duration) {
	var config = {
        apiKey: "AIzaSyDUSIwpPgxrzim4lpnM0ATCRTsmC9lbzdk",
        authDomain: "classroomvideo-49965.firebaseapp.com",
        databaseURL: "https://classroomvideo-49965.firebaseio.com",
        projectId: "classroomvideo-49965",
        storageBucket: "classroomvideo-49965.appspot.com",
        messagingSenderId: "826703245914"
      };
    firebase.initializeApp(config);
    // firebase.database().ref().child('Annotations').child(vid)
}

function addAnnotationToDb(videoID, annotation) {
	let annotationTable = firebase.database().ref().child('Annotations').child('testVideoID').child(annotation.user).child(annotation.frame);
	var newref = annotationTable.push();
  	newref.set({
    	"top": annotation.top,
    	"left": annotation.left,
    	"width": annotation.width,
    	"height": annotation.height,
    	"emotions": annotation.emotions,
        "id": annotation.annotationID;
  	});
    annotation.setDbId(newref.getKey());
    annotation.setAnnotationId(newref.getKey());
    return annotation;
}

function deleteAnnotationFromDb(videoURL, annotation) {
    debugger;
    let annotationTable = firebase.database().ref().child('Annotations').child(videoURL).child(annotation.user).child(annotation.frame);
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
        "emotions": annotation.emotions,
        "id": annotation.annotationID
    };
    updates['/Annotations/'+videoURL+'/'+annotatorID+'/'+frame.toString()+'/'+annotation.dbID] = updateData;
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
