/* @AUTHOR David Swenarton & Mingquan Liu */

var currentFrame = 1
var frameDuration = 0.5
var selectedAnnotationObject = null
var annotationsByFrame = {};
var videoURL = localStorage['videoURL'];
var videoID = localStorage['videoID'];
var loggedIn = localStorage['userLoggedIn'];

var faceIdList = []

var xRatio = 1
var yRatio = 1

class Annotation {

    constructor(user, frame, html, emotions) {
        this.user = user;
        this.frame = frame;
        this.html = html;
        if (emotions == null) {
            this.emotions = {"Happy":false, "Sad":false, "Frustrated":false, "Engaged":false, "Asleep":false};
        } else {
            this.emotions = emotions;
        }
        this.top = -1
        this.left = -1
        this.width = -1
        this.height = -1
    }
    setDBValues(top, left, width, height){
        this.top = top
        this.left = left
        this.width = width
        this.height = height
    }

    setAnnotationId(id) {
        this.annotationID = id;
    }

    setDbId(id) {
        this.dbID = id;
    }
}

function video_ended() {
    // What you want to do after the event
    document.getElementById("playbutton").innerText = "Play"
}

//Clears all annotations off of UI for current frame, leaves data stored for frame
function clearAllAnnotations(frame) {
	var allChildren = $("#video_box").children();
	for (var i = 0; i < allChildren.length; i++) {
		let child = allChildren[i]
		let vpc = document.getElementById("vplayer_container");
		if (vpc != child) {
		    if (selectedAnnotationObject != null) {
		        deselect_label(selectedAnnotationObject);
            }
			allChildren[i].remove();
		}
	}
	selectedAnnotationObject = null;
}

function displayEmotionsForAnnotation(annotation) {
    let stored = annotationsByFrame[currentFrame];
    if (stored != null) {
        let emotions = annotation.emotions;
        for (let emotion in emotions) {
            let isSelected = emotions[emotion]
            const entry = $('<li>' + emotion + '</li>');
            if (isSelected) {
                entry.addClass("emotionlistitem-selected");
            } else {
                entry.addClass("emotionlistitem");
            }

            entry.on('click', function () {
                let emotions_array = emotions;
                let emotion_value = new String(emotion);
                if (entry.attr('class') == "emotionlistitem-selected") {
                    emotions_array[emotion_value] = false;
                    updateAnnotationInDb(videoID, annotation)
                    entry.removeClass("emotionlistitem-selected");
                    entry.addClass("emotionlistitem");
                } else {
                    emotions_array[emotion_value] = true;
                    updateAnnotationInDb(videoID, annotation)
                    entry.removeClass("emotionlistitem");
                    entry.addClass("emotionlistitem-selected");
                }
            });

            $("#emotionlist").append(entry);
        }

        $('#emotionlist').removeClass("emotionlistempty");
        $('#emotionlist').addClass("emotionlist");
    }
}

function emptyEmotionsList() {
    $('#emotionlist').removeClass("emotionlist");
    $('#emotionlist').addClass("emotionlistempty");
    var allChildren = $('#emotionlist').children()
    for (var i = 0; i < allChildren.length; i++) {
        allChildren[i].remove();
    }
}

function select_label(annotation) {
    annotation.html.removeClass("annotation");
    annotation.html.addClass("annotation-selected");
    selectedAnnotationObject = annotation

    displayEmotionsForAnnotation(selectedAnnotationObject);
    showFaceLabel(selectedAnnotationObject);
}

function deselect_label(annotation) {
    if (annotation != null) {
        annotation.html.removeClass("annotation-selected");
        annotation.html.addClass("annotation");
    }
    selectedAnnotationObject = null;
    emptyEmotionsList();
    hideFaceLabel()
}

function deleteSingleAnnotation(annotation) {
    debugger;
    deleteAnnotationFromDb('testVideoID', annotation);
    let indexToDelete = annotationsByFrame[currentFrame].indexOf(annotation)
    if (indexToDelete >= 0) {
        annotationsByFrame[currentFrame].splice(indexToDelete, 1);
    }
}

function is_in_annotation(annotation, x, y){
    let top = parseInt(annotation.css('top'),10)
    let left = parseInt(annotation.css('left'),10)
    let width = parseInt(annotation.css('width'),10)
    let height = parseInt(annotation.css('height'),10)
    console.log(top+" "+left+" "+width+" "+height)
    console.log(x+" "+y)
    if(x<left || x>left+width){
        return false
    }
    if(y<top || y>top+height){
        return false
    }
    return true
}

function select_a_annotation(x,y){
    if (currentFrame in annotationsByFrame) {
        let stored = annotationsByFrame[currentFrame];
        for (var i = 0; i < stored.length; i++) {
            annotationHtml = stored[i].html;
            if (is_in_annotation(annotationHtml, x, y))
                return stored[i]
        }
    }
    return null
}

function displayStoredAnnotations() {
	if (currentFrame in annotationsByFrame) {
		let stored = annotationsByFrame[currentFrame];
		if(stored!=null){
            for (var i = 0; i < stored.length; i++) {
                annotationHtml = stored[i].html;
                if(annotationHtml.attr('class') == "annotation-selected"){
                    annotationHtml.removeClass("annotation");
                    annotationHtml.addClass("annotation-selected");
                }
                annotationHtml.appendTo('#video_box');
            }
        }
	}
}

function updateAnnotationsOnFrameChange(time) {
    currentFrame = Math.floor(time/frameDuration)+1;
    document.getElementById('debugtext').innerHTML = "Frame Number: " + currentFrame;
    clearAllAnnotations(currentFrame);
    if (annotationsByFrame != null && currentFrame in annotationsByFrame) {
        let frameList = annotationsByFrame[currentFrame];
        for (let i = 0; i < frameList.length; i++) {
            frameList[i] = dbToUITransform(frameList[i],1,1);
        }
    }
    displayStoredAnnotations();
}

function show_slider_value() {
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    var mediaElement = $("#vplayer").get(0);
    var duration = mediaElement.duration;
    var time = parseFloat(slider.value / 100 * duration)
    output.innerHTML = time.toFixed(2) + " / " + duration.toFixed(2)
    mediaElement.currentTime = time
    mediaElement.pause()
}

function play_jquery() {
    // $('#playbutton').click(function () {
    if (!$("#vplayer").get(0).paused) {
        $("#vplayer").get(0).pause();
        document.getElementById("playbutton").innerText = "Play "
    } else {
        $("#vplayer").get(0).play();
        document.getElementById("playbutton").innerText = "Pause"
    }
    // });
}

function change_frame(isNext) {
    var cTime = $("#vplayer").get(0).currentTime;
    var duration = $("#vplayer").get(0).duration;
    var changed_time;
    if (isNext) {
        if (currentFrame != Math.floor(duration/frameDuration)+1){
            changed_time = (currentFrame)*frameDuration;
        }
    } else {
        changed_time = (currentFrame-2)*frameDuration;
    }

    if (changed_time > duration) {
        changed_time = duration;
    }
    if (changed_time < 0) {
        changed_time = 0;
    }
    $("#vplayer").get(0).currentTime = changed_time
    $("#vplayer").get(0).pause();
    document.getElementById("playbutton").innerText = "Play"
}

function restart_video() {
    $("#vplayer").get(0).currentTime = 0.0
    $("#vplayer").get(0).play();
}

function rewind_video() {
    //Create a variable to manage video elements
    var mediaElement = $("#vplayer").get(0);

    //Adjust playhead (currentTime) to 0 if elapsed time is less than 2 seconds else adjust it to the elapsed time minus 2 seconds
    if (mediaElement.currentTime < 2) {
        mediaElement.currentTime = 0;
    } else {
        mediaElement.currentTime = mediaElement.currentTime - 2;
    }
}

function resize_slider() {
    $('#slider').css('width', $('#video_box').css('width'));
}

function change_slider() {
    var time = $("#vplayer").get(0).currentTime;
    var duration = $("#vplayer").get(0).duration;
    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");
    var percentage = parseFloat(time / duration).toFixed(2) * 100
    slider.value = percentage;
    output.innerHTML = time.toFixed(2) + " / " + duration.toFixed(2)
	updateAnnotationsOnFrameChange(time);
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function showDropDown() {
    document.getElementById("myDropdown").classList.toggle("show");
    document.getElementById("add_new").classList.toggle("show")
}

function showFaceLabel(annotation) {

    if( $("#face_id_but").is(':visible')){

    }
    // $("face_id_but").css("display", "block");
    else{
        document.getElementById("myInput").value = ""
        for( var i = 0; i < faceIdList.length; i++){
            const faceId = $('<a>' + faceIdList[i] + '</a>');
            faceId.on('click', function () {
                annotation.setAnnotationId(this.innerHTML)
                debugger
                updateAnnotationInDb(videoID, annotation)

                document.getElementById("face_id_but").innerHTML = this.innerHTML
                showDropDown()
            })
            $("#myDropdown").append(faceId)

        }
        document.getElementById("face_id_but").classList.toggle("show");
        document.getElementById("face_id_but").innerHTML = annotation.annotationID
    }

}

function hideFaceLabel() {
    var allChildren = $('#myDropdown').children()
    for (var i = 1; i < allChildren.length; i++) {
        allChildren[i].remove();
    }
    if ($("#face_id_but").is(':visible')) {
        document.getElementById("face_id_but").classList.toggle("show");
    }
    if ($("#myDropdown").is(':visible')) {
        showDropDown()
    }
}

function add_new_face_id() {
    debugger
    new_face = document.getElementById("myInput").value
    if(new_face != null){
        selectedAnnotationObject.setAnnotationId(new_face)
        updateAnnotationInDb(videoID, selectedAnnotationObject)
        document.getElementById("face_id_but").innerHTML = new_face
        faceIdList.push(new_face)
        document.getElementById("myInput").value = ""
        for( var i = 0; i < faceIdList.length; i++){
            const faceId = $('<a>' + faceIdList[i] + '</a>');
            faceId.on('click', function () {
                selectedAnnotationObject.setAnnotationId(this.innerHTML)
                debugger
                updateAnnotationInDb(videoID, selectedAnnotationObject)

                document.getElementById("face_id_but").innerHTML = this.innerHTML
                showDropDown()
            })
            $("#myDropdown").append(faceId)

        }
        showDropDown()
    }
}

function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

function addAnnotation(annotation, frame) {
    annotation = UITodbTransform(annotation,1, 1);
    addAnnotationToDb(videoID, loggedIn, annotation);
	if (frame in annotationsByFrame) {
		annotationsByFrame[frame].push(annotation);
	} else {
		annotationsByFrame[frame] = [];
		annotationsByFrame[frame].push(annotation);
	}
}




$(document).ready(function() {
    let drawmode = false;
    let mouse_flag = false;
    let drawingAnnotation = null;
    let drawingAnnotationX = 0;
    let drawingAnnotationY = 0;
    let pageX = 10;
    let pageY = 80;
    let relativeDiffX = 0;
    let relativeDiffY = 0;
    let clickMode = false;
    //Calculation of ratio will be done here
    xRatio = 1;
    yRatio = 1;
    
    $("#vplayer").attr("src", videoURL);

    function setValuesForAnnotation(annotation, top, left, height, width){
        if(top != null){
            annotation.css("top", top+'px');
        }
        if(left != null){
            annotation.css("left", left+'px');
        }
        if(height != null){
            annotation.css("width", width+'px');
        }
        if(width != null){
            annotation.css("height", height+'px');
        }
    }

    function movingLogic(x, y){
        let vHeight = parseInt($('#vplayer').css('height'),10)
        let vWidth = parseInt($('#vplayer').css('width'),10)

        let width = parseInt(selectedAnnotationObject.html.css('width'),10)
        let height = parseInt(selectedAnnotationObject.html.css('height'),10)
        let top = (y - relativeDiffY)
        let left = (x - relativeDiffX)

        if(left>pageX && (left+width)<(pageX+vWidth)){
            setValuesForAnnotation(selectedAnnotationObject.html,null, left, null, null)
        }
        if(top>pageY && (top+height)<(pageY+ vHeight)){
            setValuesForAnnotation(selectedAnnotationObject.html,top, null, null, null)
        }
    }

    function drawingLogic(x, y){
        let left = (drawingAnnotationX > x)?x:drawingAnnotationX;
        let top = (drawingAnnotationY <y)?drawingAnnotationY:y;
        let width = (drawingAnnotationX < x)?(x-drawingAnnotationX):(drawingAnnotationX-x);
        let height = (drawingAnnotationY < y)?(y-drawingAnnotationY):(drawingAnnotationY-y);
        let vHeight = parseInt($('#vplayer').css('height'),10)
        let vWidth = parseInt($('#vplayer').css('width'),10)
        if( (pageY+vHeight)<(top+height)){
            height = pageY+vHeight- top;
        }
        if((pageX+vWidth) <(left+width)){
            width = pageX+ vWidth - left;
        }
        setValuesForAnnotation(drawingAnnotation, top, left, height, width)
    }

    function resetDrawingVariables(){
        $('#video_box').css('cursor', "default");
        drawmode = false;
        mouse_flag = false;
        drawingAnnotation = null
    }

    function resetClickingVariables(){
        relativeDiffX = 0;
        relativeDiffY = 0;
        clickMode = false;
    }

    function createDrawing(x, y){
        mouse_flag = true;
        let annotationHtml = jQuery('<div/>', {
            class: 'annotation',
        });
        drawingAnnotation = annotationHtml;
        drawingAnnotationX = x;
        drawingAnnotationY = y;
        drawingAnnotation.appendTo('#video_box');
    }

    function highlightClicking(x, y){
        select_label(selectedAnnotationObject);
        let top =  parseInt(selectedAnnotationObject.html.css('top'),10)
        let left = parseInt(selectedAnnotationObject.html.css('left'),10)
        relativeDiffX = x-left;
        relativeDiffY = y-top;
        clickMode = true;
    }

    initializeDb();
    loadStoredData(annotationsByFrame, videoID, loggedIn)

    $('#page_body').on('mouseup', function (e) {
        if(drawmode){
            if(mouse_flag){
                const x = e.pageX;
                const y = e.pageY;
                drawingLogic(x, y)
                let newAnnotation = new Annotation(loggedIn, currentFrame, drawingAnnotation, null);
                deselect_label(selectedAnnotationObject);
                addAnnotation(newAnnotation, currentFrame);
                selectedAnnotationObject = newAnnotation;
                resetDrawingVariables()
            }
        }
        if(clickMode == true)
            clickMode = false;
    })
    // $('#page_body').on('mousemove', function (e) {
    //     if(drawmode) {
    //         if (mouse_flag) {
    //             const x = e.pageX;
    //             const y = e.pageY;

    //             let left = (drawingAnnotationX > x)?x:drawingAnnotationX;
    //             let top = (drawingAnnotationY >y)?y:drawingAnnotationY;
    //             left = (left<pageX)?pageX:left
    //             top = (top<pageY)?pageY:top
    //             let width = Math.abs(x-drawingAnnotationX);
    //             let height = Math.abs(y-drawingAnnotationY);
    //             let vHeight = parseInt($('#vplayer').css('height'),10)
    //             let vWidth = parseInt($('#vplayer').css('width'),10)
    //             if( (pageY+vHeight)<(top+height)){
    //                 height = pageY+vHeight- top;
    //             }
    //             if((pageX+vWidth) <(left+width)){
    //                 width = pageX+ vWidth - left;
    //             }

    //             drawingAnnotation.css("top", top+'px');
    //             drawingAnnotation.css("left", left+'px');
    //             drawingAnnotation.css("width", width+'px');
    //             drawingAnnotation.css("height", height+'px');
    //         }
    //     }
    // });

    $('#drawbutton').on('click', function () {
        if (drawmode == true) {
            drawmode = false;
            $('#video_box').css('cursor', 'default');
        } else {
            drawmode = true;
            $('#video_box').css('cursor', 'crosshair');
        }
    });

    $('#dltbutton').on('click', function() {
        if (selectedAnnotationObject != null) {
            obj = selectedAnnotationObject
            deselect_label(selectedAnnotationObject)

            deleteSingleAnnotation(obj);
            obj.html[0].remove();
        }
        emptyEmotionsList();
    });

    $('#dltallbutton').on('click', function() {
        annotationsByFrame[currentFrame] = [];
		var allChildren = $("#video_box").children();
		for (var i = 0; i < allChildren.length; i++) {
			child = allChildren[i]
			vpc = document.getElementById("vplayer_container");
			if (vpc != child) {
				allChildren[i].remove();
			}
		}
        emptyEmotionsList();
    });

    $('#video_box').on('mousedown', function (e) {
        if (drawmode == true) {
            if(mouse_flag == false){
                const x = e.pageX;
                const y = e.pageY;
                createDrawing(x, y)
            }
        }
        else{
            const x = e.pageX;
            const y = e.pageY;
            // First it needs to select a annotation
            deselect_label(selectedAnnotationObject);
            selectedAnnotationObject = select_a_annotation(x,y)

            if(selectedAnnotationObject == null){
                resetClickingVariables()
            }
            else {
                const x = e.pageX;
                const y = e.pageY;
                highlightClicking(x, y)
            }
        }
    });

    $('#video_box').on('mousemove', function (e) {
        const x = e.pageX;
        const y = e.pageY;
        if(drawmode) {
            if (mouse_flag) {
                drawingLogic(x, y)
            }
        }else{
            if(clickMode){
                movingLogic(x, y)
            }
        }
    });

    $('#video_box').on('mouseup', function (e) {
        const x = e.pageX;
        const y = e.pageY;
        if(drawmode){
            if(mouse_flag){
                drawingLogic(x, y)
                //this is for testing the UITodbtransform function
                let newAnnotation = new Annotation(loggedIn, currentFrame, drawingAnnotation, null);
                deselect_label(selectedAnnotationObject);
                addAnnotation(newAnnotation, currentFrame);
                selectedAnnotationObject = newAnnotation;
                resetDrawingVariables()
            }
        }else{
            if(clickMode){
                movingLogic(x, y)
                selectedAnnotationObject = UITodbTransform(selectedAnnotationObject, xRatio, yRatio);
                updateAnnotationInDb(videoID, selectedAnnotationObject);
                resetClickingVariables()

            }else{
                deselect_label(selectedAnnotationObject);
            }
        }
    });

});