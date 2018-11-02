/* @AUTHOR David Swenarton & Mingquan Liu */

var currentFrame = 1
var frameDuration = 0.5
var selectedAnnotation = null;
var selectedAnnotationLabels = {};
var annotationsByFrame = {};

function video_ended() {
    // What you want to do after the event
    document.getElementById("playbutton").innerText = "Play"
}

//Clears all annotations off of UI for current frame, leaves data stored for frame
function clearAllAnnotations(frame) {
	var allChildren = $("#video_box").children();
	for (var i = 0; i < allChildren.length; i++) {
		child = allChildren[i]
		vpc = document.getElementById("vplayer_container");
		if (vpc != child) {
            if (selectedAnnotation != null) {
                if (child === selectedAnnotation[0]) {
                    deselect_label(selectedAnnotation);
                }
            }
			allChildren[i].remove();
		}
	}
	selectedAnnotation = null;
}

//Deletes all annotation data for given frame, then calls clearAllAnnotations to clear the UI
function deleteAllAnnotations(frame) {
	annotationsByFrame[frame] = [];
	clearAllAnnotations(frame);
}

function displayStoredAnnotations() {
	if (currentFrame in annotationsByFrame) {
		let stored = annotationsByFrame[currentFrame];
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

function updateAnnotationsOnFrameChange(time, duration) {
    currentFrame = Math.floor(time/frameDuration)+1;
    document.getElementById('debugtext').innerHTML = "Frame Number: " + currentFrame;
    clearAllAnnotations(currentFrame);
    displayStoredAnnotations();
}

function show_slider_value() {
    // document.getElementById("playbutton").innerText = "Play"
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
        changed_time = cTime + frameDuration;
    } else {
        changed_time = cTime - frameDuration;
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
    // $('#restartbutton').click(function () {
    $("#vplayer").get(0).currentTime = 0.0
    $("#vplayer").get(0).play();
    // })
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

function resize_canvas() {
    $("#myCanvas").css("border", "3px solid red");
    $('#myCanvas').css('height', $('#vplayer').css('height'));
    $('#myCanvas').css('width', $('#vplayer').css('width'));
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
	updateAnnotationsOnFrameChange(time, duration);
}

function getAnnotationObjFromHtml(annotation) {
    let stored = annotationsByFrame[currentFrame];
    for (var i = 0; i < stored.length; i++) {
        let annotationHtml = stored[i].html;
        if (annotation[0] === annotationHtml[0]) {
            return stored[i];
        }
    }
    return null;
}

function displayEmotionsForAnnotation(annotation) {
    let stored = annotationsByFrame[currentFrame];
    for (var i = 0; i < stored.length; i++) {
        let annotationHtml = stored[i].html;
        if (annotation[0] === annotationHtml[0]) {
            let emotions = stored[i].emotions;
            for (let emotion in emotions) {
                let isSelected = emotions[emotion]
                const entry = $('<li>'+emotion+'</li>');
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
                        entry.removeClass("emotionlistitem-selected");
                        entry.addClass("emotionlistitem");
                    } else {
                        emotions_array[emotion_value] = true;
                        entry.removeClass("emotionlistitem");
                        entry.addClass("emotionlistitem-selected");
                    }
                });


                // entry.onclick = function () {
                //     if (entry.classList.contains("emotionlistitem")) {
                //         emotions[emotion] = true;
                //         entry.classList.remove("emotionlistitem");
                //         entry.classList.add("emotionlistitem-selected");
                //     } else if (entry.classList.contains("emotionlistitem-selected")) {
                //         emotions[emotion] = false;
                //         entry.classList.remove("emotionlistitem-selected");
                //         entry.classList.add("emotionlistitem");
                //     }
                // };
                $("#emotionlist").append(entry);
            }
        }
    }
    $('#emotionlist').removeClass("emotionlistempty");
    $('#emotionlist').addClass("emotionlist");
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
    annotation.removeClass("annotation");
    annotation.addClass("annotation-selected");
    selectedAnnotation = annotation
    displayEmotionsForAnnotation(selectedAnnotation);
}

function deselect_label(annotation) {
    if (annotation != null) {
        annotation.removeClass("annotation-selected");
        annotation.addClass("annotation");
    }
    selectedAnnotation = null
    emptyEmotionsList();
}

function deleteSingleAnnotation(annotation) {
    var annotationObj = getAnnotationObjFromHtml(annotation);
    let indexToDelete = -1
    let allAnnotations = annotationsByFrame[currentFrame];
    for (let i = 0; i < allAnnotations.length; i++) {
        let atIndex = allAnnotations[i];
        if (annotation == atIndex.html) {
            indexToDelete = i
        }
    }
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
                return annotationHtml
        }
    }
    return null
}

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
}

function addAnnotation(annotation, frame) {
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
    let newAnnotationObj = null;
    let pageX = 10;
    let pageY = 80;
    let relativeDiffX = 0;
    let relativeDiffY = 0;
    let clickMode = false;

    initializeDb();

    $('#page_body').on('mouseup', function (e) {
        if(drawmode){
            if(mouse_flag){
                document.getElementById('debugtext').innerHTML = "ON Mouse Up";
                const x = e.pageX;
                const y = e.pageY;

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

                drawingAnnotation.css("top", top+'px');
                drawingAnnotation.css("left", left+'px');
                drawingAnnotation.css("width", width+'px');
                drawingAnnotation.css("height", height+'px');
                deselect_label(selectedAnnotation)
                select_label(drawingAnnotation)
                selectedAnnotation = drawingAnnotation
                $('#video_box').css('cursor', "default");
                drawmode = false;
                mouse_flag = false;
                drawingAnnotation = null
            }
        }
        if(clickMode == true)
        clickMode = false;
        //document.getElementById('debugtext').innerHTML = "Clicked"
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
            document.getElementById('debugtext').innerHTML = "DRAW MODE OFF";
            $('#video_box').css('cursor', 'default');
        } else {
            drawmode = true;
            document.getElementById('debugtext').innerHTML = "DRAW MODE ON";
            $('#video_box').css('cursor', 'crosshair');
        }
    });

    $('#dltbutton').on('click', function() {
        if (selectedAnnotation != null) {
            deleteSingleAnnotation(selectedAnnotation);
        	var allChildren = $("#video_box").children();
        	for (var i = 0; i < allChildren.length; i++) {
				var tableChild = allChildren[i];
				if (tableChild === selectedAnnotation[0]) {	
				    selectedAnnotation.remove();
            		selectedAnnotation = null
				}
			}
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

    $('#displaybtn').on('click', displayStoredAnnotations);

    $('#item1').on('click', function() {
        if ($('#item1').attr('class')== "emotionlistitem") {
            $('#item1').attr('class', "emotionlistitem-selected");
        } else if ($('#item1').attr('class') == "emotionlistitem-selected") {
            $('#item1').attr('class', "emotionlistitem" );
        }
    });

    $('#video_box').on('mousedown', function (e) {
        if (drawmode == true) {
            if(mouse_flag == false){
                mouse_flag = true;
                const x = e.pageX;
                const y = e.pageY;
                document.getElementById('debugtext').innerHTML = "(" + x + ", " + y + ")";
                let annotationHtml = jQuery('<div/>', {
                    class: 'annotation',
                });
                drawingAnnotation = annotationHtml;
                drawingAnnotationX = x;
                drawingAnnotationY = y;
                newAnnotation = new Annotation("testUser", currentFrame, drawingAnnotation, null);
                addAnnotation(newAnnotation, currentFrame);
                drawingAnnotation.appendTo('#video_box');
            }
        }
        else{
            const x = e.pageX;
            const y = e.pageY;
            // First it needs to select a annotation
            deselect_label(selectedAnnotation);
            selectedAnnotation = select_a_annotation(x,y)
            if(selectedAnnotation == null){
                console.log("IS NULL")
                relativeDiffX = 0;
                relativeDiffY = 0;
                clickMode = false;
            }
            else {
                select_label(selectedAnnotation)
                let top =  parseInt(selectedAnnotation.css('top'),10)
                let left = parseInt(selectedAnnotation.css('left'),10)
                const x = e.pageX;
                const y = e.pageY;
                relativeDiffX = x-left;
                relativeDiffY = y-top;
                clickMode = true;
            }
        }
    });

    $('#video_box').on('mousemove', function (e) {

        if(drawmode) {
            if (mouse_flag) {
                const x = e.pageX;
                const y = e.pageY;

                let left = (drawingAnnotationX > x)?x:drawingAnnotationX;
                let top = (drawingAnnotationY >y)?y:drawingAnnotationY;
                let width = Math.abs(x-drawingAnnotationX);
                let height = Math.abs(y-drawingAnnotationY);
                let vHeight = parseInt($('#vplayer').css('height'),10)
                let vWidth = parseInt($('#vplayer').css('width'),10)
                if( (pageY+vHeight)<(top+height)){
                    height = pageY+vHeight- top;
                }
                if((pageX+vWidth) <(left+width)){
                    width = pageX+ vWidth - left;
                }

                drawingAnnotation.css("top", top+'px');
                drawingAnnotation.css("left", left+'px');
                drawingAnnotation.css("width", width+'px');
                drawingAnnotation.css("height", height+'px');
            }
        }else{
            if(clickMode){
                const x = e.pageX;
                const y = e.pageY;

                let vHeight = parseInt($('#vplayer').css('height'),10)
                let vWidth = parseInt($('#vplayer').css('width'),10)

                let width = parseInt(annotationHtml.css('width'),10)
                let height = parseInt(annotationHtml.css('height'),10)
                let top = (y - relativeDiffY)
                let left = (x - relativeDiffX)

                if(left>pageX && (left+width)<(pageX+vWidth)){
                    annotationHtml.css("left", left + 'px')
                }
                if(top>pageY && (top+height)<(pageY+ vHeight)){
                    annotationHtml.css("top", top + 'px')
                }
            }
        }
    });

    $('#video_box').on('mouseup', function (e) {
        if(drawmode){
            if(mouse_flag){
                document.getElementById('debugtext').innerHTML = "ON Mouse Up";
                const x = e.pageX;
                const y = e.pageY;

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

                drawingAnnotation.css("top", top+'px');
                drawingAnnotation.css("left", left+'px');
                drawingAnnotation.css("width", width+'px');
                drawingAnnotation.css("height", height+'px');

                deselect_label(selectedAnnotation)
                select_label(drawingAnnotation)
                $('#video_box').css('cursor', "default");
                drawmode = false;
                mouse_flag = false;
                drawingAnnotation = null
            }
        }else{
            if(clickMode){
                const x = e.pageX;
                const y = e.pageY;
                let vHeight = parseInt($('#vplayer').css('height'),10)
                let vWidth = parseInt($('#vplayer').css('width'),10)

                let width = parseInt(annotationHtml.css('width'),10)
                let height = parseInt(annotationHtml.css('height'),10)
                let top = (y - relativeDiffY)
                let left = (x - relativeDiffX)

                if(left>pageX && (left+width)<(pageX+vWidth)){
                    annotationHtml.css("left", left + 'px')
                }
                if(top>pageY && (top+height)<(pageY+ vHeight)){
                    annotationHtml.css("top", top + 'px')
                }
                relativeDiffX = 0;
                relativeDiffY = 0;
                clickMode = false;
            }else{
                deselect_label(selectedAnnotation)
            }
        }
    });

    // Authenticated DB IAM role: Cognito_ClassroomLabellingSystemAuth_Role
    // Unauthenticated DB IAM role: Cognito_ClassroomLabellingSystemUnauth_Role
    // identity pool id: "us-east-2:4d581a21-bd4a-4f91-a41e-30b8db3397e1"

});