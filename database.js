
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

function loadFrameDuration(frameDuration, videoId, annotatorId){
    var leadsRef = firebase.database().ref().child('Annotations').child(videoId).child(annotatorId)
    leadsRef.once('value', function(snapshot) {
        if (snapshot.hasChild("frameduration")) {
            frameDuration = snapshot.child("frameduration").val()
            console.log("frameduration")
        }
        change_frame_duration(frameDuration)
        reset_slider()
    });
}

function loadFaceIdList(videoId, annotatorId){
    var initref = firebase.database().ref().child('Annotations').child(videoId).child(annotatorId);
    initref.once('value').then(function(snapshot) {
        if(snapshot.hasChild("identity")){

        }
        printIt()
    });
}

function loadStoredData(annotationsByFrame,frameDuration, videoID, annotatorID) {
    let annotationsByFrameTemp = {}
    var initref = firebase.database().ref().child('Annotations').child(videoID).child(annotatorID);
    initref.once('value').then(function(snapshot) {
        console.log(snapshot.childrenCount);
        var exist = false
        snapshot.forEach(function(childSnapshot) {
            let frameKey = childSnapshot.key;
            var childData = childSnapshot.val();
            if(frameKey == "frameduration"){
                frameDuration = snapshot.child("frameduration").val()
                console.log("frameduration")
            }else if(frameKey =="identity"){
                snapshot.child("identity").forEach(function (child) {
                    var faceIdentity = new FaceIdentity(child.key, child.val())
                    faceIdList.push(faceIdentity)
                })
            }else{
                for (var dbAnnotationKey in childData) {
                    let dbAnnotation = childData[dbAnnotationKey];
                    let newAnno = new Annotation(dbAnnotation['user'], frameKey, null, dbAnnotation["emotions"]);
                    newAnno.setDBValues(dbAnnotation["top"],dbAnnotation["left"],dbAnnotation["width"],dbAnnotation["height"]);
                    newAnno.setAnnotationId(dbAnnotation["id"]);
                    newAnno.setDbId(dbAnnotationKey)
                    if (frameKey in annotationsByFrame) {
                        annotationsByFrame[frameKey].push(newAnno);
                    } else {
                        annotationsByFrame[frameKey] = [];
                        annotationsByFrame[frameKey].push(newAnno);
                    }
                }
            }
        });
        if (frameDuration != null){
            change_frame_duration(frameDuration)
        }
        updateAnnotationsOnFrameChange(0);
        reset_slider()
        printIt()
    });
}

function addFaceIdentityToDb(videoID, user, id_string, image_file) {
    let ref = firebase.database().ref().child('Annotations').child(videoID).child(user).child('identity');
    ref.once('value', function(snapshot) {
        ref.child(id_string).set(image_file)
    });
}

function deleteFaceIdentityFromDb(videoID, user, id_string) {
    firebase.database().ref().child('Annotations').child(videoID).child(annotation.user).child('identity').child(id_string).remove();
}

function addAnnotationToDb(videoID, user, annotation) {
    let ref = firebase.database().ref().child('Annotations').child(videoID).child(annotation.user);
    ref.once('value', function(snapshot) {
        debugger;
        if (snapshot.hasChild(annotation.frame.toString())) {
            let annotationTable = firebase.database().ref().child('Annotations').child(videoID).child(annotation.user).child(annotation.frame);
            var newref = annotationTable.push();
            let json = {
                "top": annotation.top,
                "left": annotation.left,
                "width": annotation.width,
                "height": annotation.height,
                "emotions": annotation.emotions,
                "user": annotation.user,
                "id": "Unlabeled"
            };
            newref.set(json);
            annotation.setDbId(newref.getKey());
            annotation.setAnnotationId("Unlabeled");
        } else {
            let randomkey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            let json = {[randomkey]: {
                "top": annotation.top,
                "left": annotation.left,
                "width": annotation.width,
                "height": annotation.height,
                "emotions": annotation.emotions,
                    "user": annotation.user,
                "id": "Unlabeled"
            }};
            annotation.setAnnotationId("Unlabeled");
            annotation.setDbId(randomkey);
            ref.child(annotation.frame.toString()).set(json);
        }
        select_label(annotation)
    });
}

function deleteAnnotationFromDb(videoURL, annotation) {
    let annotationTable = firebase.database().ref().child('Annotations').child(videoURL).child(annotation.user).child(annotation.frame);
    annotationTable.child(annotation.dbID).remove();
}

function updateAnnotationInDb(videoURL, annotation) {
    let updates = {};
    let updateData = {
        "top": annotation.top,
        "left": annotation.left,
        "width": annotation.width,
        "height": annotation.height,
        "emotions": annotation.emotions,
        "user": annotation.user,
        "id": annotation.annotationID
    };
    updates['/Annotations/'+videoURL+'/'+annotation.user+'/'+annotation.frame+'/'+annotation.dbID] = updateData;
    firebase.database().ref().update(updates);
}

function updateAnnotationIdInDb(videoURL, annotatorID, annotation, frame) {
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

