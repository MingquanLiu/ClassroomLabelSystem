/* @AUTHOR David Swenarton & Mingquan Liu */

function video_ended() {
    // What you want to do after the event
    document.getElementById("playbutton").innerText = "Play"
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
    $("#vplayer").load()

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
    $("#vplayer").load()
    // });
}

function change_frame(isNext) {
    var cTime = $("#vplayer").get(0).currentTime;
    var duration = $("#vplayer").get(0).duration;
    var changed_time;
    if (isNext) {
        changed_time = cTime + 5;
    } else {
        changed_time = cTime - 5;
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
    $("#vplayer").load()

}

function restart_video() {
    // $('#restartbutton').click(function () {
    $("#vplayer").get(0).currentTime = 0.0
    $("#vplayer").get(0).play();
    $("#vplayer").load()
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
    $("#vplayer").load()
}

function resize_canvas() {
    // $("#myCanvas").css("position", "relative");
    // $("#myCanvas").css("width", $("#vcontainer").width());
    // $("#myCanvas").css("height", $("#vcontainer").height());
    // $("#myCanvas").css("top", $("#vcontainer").css('top'));
    // $("#myCanvas").css("left", $("#vcontainer").css('left'));
    // $("#myCanvas").css("right", $("#vcontainer").css('right'));
    // $("#myCanvas").css("bottom", $("#vcontainer").css('bottom'));
    //
    // var slider = document.getElementById("myRange");
    // var output = document.getElementById("demo");
    //
    // output.innerHTML = parseFloat(0).toFixed(2) + " / " + $("#vplayer").get(0).duration.toFixed(2)
    // slider.value = 0

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
}

function select_label(annotation) {
    annotation.removeClass("annotation");
    annotation.addClass("annotation-selected");

    // annotation.css('background-color', '#2ECC40');
    // annotation.css('opacity', 1.0)
}

function deselect_label(annotation) {
    if (annotation != null) {
        annotation.removeClass("annotation-selected");
        annotation.addClass("annotation");

        // annotation.css('background-color', '#DDDDDD');
    }
}



$(document).ready(function() {
    let drawmode = false;
    var selectedAnnotation = null;
    let mouse_flag = false;
    let drawingAnnotation = null;
    let drawingAnnotationX = 0;
    let drawingAnnotationY = 0;
    let pageX = 11;
    let pageY = 82;

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
            selectedAnnotation.remove();
        }
    });

    $('#video_box').on('mousedown', function (e) {
        if (drawmode == true) {
            if(mouse_flag == false){
                mouse_flag = true;
                const x = e.pageX;
                const y = e.pageY;
                document.getElementById('debugtext').innerHTML = "(" + x + ", " + y + ")";
                let newAnnotation = jQuery('<div/>', {
                    class: 'annotation',
                });
                // drawingAnnotation.css("top", y+'px');
                // drawingAnnotation.css("left", x+'px');
                newAnnotation.on('click', function() {
                    if (newAnnotation.is(selectedAnnotation)){
                        deselect_label(selectedAnnotation);
                        selectedAnnotation = null;
                    } else {
                        deselect_label(selectedAnnotation);
                        selectedAnnotation = newAnnotation;
                        select_label(newAnnotation);
                    }
                });
                drawingAnnotation = newAnnotation;
                drawingAnnotationX = x;
                drawingAnnotationY = y;
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