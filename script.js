/* @AUTHOR David Swenarton & Mingquan Liu */

var currentFrame = 1
var frameDuration = 0.5
var selectedAnnotation = null;
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
	debugger;
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

function select_label(annotation) {
    annotation.removeClass("annotation");
    annotation.addClass("annotation-selected");
}

function deselect_label(annotation) {
    if (annotation != null) {
        annotation.removeClass("annotation-selected");
        annotation.addClass("annotation");
    }
}

class Annotation {

    constructor(user, frame, html) {
        this.user = user;
        this.frame = frame;
        this.html = html;
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
        document.getElementById('debugtext').innerHTML = "Clicked"
    })


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
        	var allChildren = $("#video_box").children();
        	for (var i = 0; i < allChildren.length; i++) {
				var tableChild = allChildren[i];
				if (tableChild === selectedAnnotation[0]) {	
				    selectedAnnotation.remove();
            		selectedAnnotation = null
				}
			}
        }
    });

    $('#dltallbutton').on('click', function() {
		var allChildren = $("#video_box").children();
		for (var i = 0; i < allChildren.length; i++) {
			child = allChildren[i]
			vpc = document.getElementById("vplayer_container");
			if (vpc != child) {
				allChildren[i].remove();
			}
		}
    });

    $('#displaybtn').on('click', displayStoredAnnotations);

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
                annotationHtml.on('click', function() {
                    if (annotationHtml.is(selectedAnnotation)){
                        deselect_label(selectedAnnotation);
                        selectedAnnotation = null;
                    } else {
                        deselect_label(selectedAnnotation);
                        selectedAnnotation = annotationHtml;
                        select_label(annotationHtml);
                    }
                });

                annotationHtml.on('mousedown', function (e) {
                    if(annotationHtml.is(selectedAnnotation)){
                        let top =  parseInt(annotationHtml.css('top'),10)
                        let left = parseInt(annotationHtml.css('left'),10)
                        const x = e.pageX;
                        const y = e.pageY;
                        relativeDiffX = x-left;
                        relativeDiffY = y-top;
                        clickMode = true;
                        document.getElementById('debugtext').innerHTML = relativeDiffY+" "+relativeDiffX

                    }else{
                        relativeDiffX = 0;
                        relativeDiffY = 0;
                        clickMode = false;
                    }
                })

                annotationHtml.on('mousemove', function (e) {
                    if(annotationHtml.is(selectedAnnotation) && clickMode ==true) {
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
                        document.getElementById('debugtext').innerHTML = "Current TOP LEFT" + top + " " + left
                    }
                })

                annotationHtml.on('mouseup', function (e) {
                    if(annotationHtml.is(selectedAnnotation) && clickMode ==true) {
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
                        document.getElementById('debugtext').innerHTML = "Current TOP LEFT" + top + " " + left
                        relativeDiffX = 0;
                        relativeDiffY = 0;
                        clickMode = false;
                        deselect_label(annotationHtml);
                        selectedAnnotation = null;
                    }
                })

                drawingAnnotation = annotationHtml;
                drawingAnnotationX = x;
                drawingAnnotationY = y;
                newAnnotation = new Annotation("testUser", currentFrame, drawingAnnotation);
                addAnnotation(newAnnotation, currentFrame);
                drawingAnnotation.appendTo('#video_box');
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
                document.getElementById('debugtext').innerHTML = " top left"+ top+" "+left+" Width Height "+ width+" "+height+
                    " video width height "+vWidth+" "+vHeight;
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
                select_label(drawingAnnotation)
                selectedAnnotation = drawingAnnotation
                $('#video_box').css('cursor', "default");
                drawmode = false;
                mouse_flag = false;
                drawingAnnotation = null
            }
        }
    });

    // Authenticated DB IAM role: Cognito_ClassroomLabellingSystemAuth_Role
    // Unauthenticated DB IAM role: Cognito_ClassroomLabellingSystemUnauth_Role
    // identity pool id: "us-east-2:4d581a21-bd4a-4f91-a41e-30b8db3397e1"

});