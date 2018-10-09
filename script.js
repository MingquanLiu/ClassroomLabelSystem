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

function add_div() {
    let parent = document.getElementById("myCanvas");
    let div = document.createElement('div')
    div.className = 'annotation';
    parent.appendChild(div);
}

function select_label(annotation) {
    annotation.css('background-color', '#2ECC40');
    annotation.css('opacity', 1.0)
}

function deselect_label(annotation) {
    if (annotation != null) {
        annotation.css('background-color', '#DDDDDD');
        annotation.css('opacity', 0.9)
    }
}



$(document).ready(function() {
    let drawmode = false;
    var selectedAnnotation = null;
    let mouse_flag = false;
    let drawingAnnotation = null;
    let drawingAnnotationX = 0;
    let drawingAnnotationY = 0;

    $('#drawbutton').on('click', function () {
        if (drawmode == true) {
            drawmode = false;
            document.getElementById('debugtext').innerHTML = "DRAW MODE OFF";
        } else {
            drawmode = true;
            document.getElementById('debugtext').innerHTML = "DRAW MODE ON";
        }
    });

    $('#dltbutton').on('click', function() {
        if (selectedAnnotation != null) {
            selectedAnnotation.remove();
        }
    });


    $('#video_box').on('mousedown', function (e) {
        if (drawmode == true) {
            mouse_flag = true;
            const x = e.pageX;
            const y = e.pageY;
            document.getElementById('debugtext').innerHTML = "(" + x + ", " + y + ")";
            drawingAnnotation = jQuery('<div/>', {
                class: 'annotation',
            });
            // drawingAnnotation.css("top", y+'px');
            // drawingAnnotation.css("left", x+'px');
            drawingAnnotationX = x;
            drawingAnnotationY = y;
            $('#video_box').css('cursor', 'crosshair');
            drawingAnnotation.appendTo('#video_box');
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
                // let vHeight = $('#vplayer').css('height')
                // let vWidth = $('#vplayer').css('width')
                // let vTop = $('#vplayer').css('top')
                // let vLeft = $('#vplayer').css('left')
                // height = (top+height)>(vTop+vHeight)?(vTop+vHeight-top):height;
                // width = (left+width) > (vLeft+vWidth)?(vLeft+vWidth-left):width;
                drawingAnnotation.css("top", top+'px');
                drawingAnnotation.css("left", left+'px');
                drawingAnnotation.css("width", width+'px');
                drawingAnnotation.css("height", height+'px');
                document.getElementById('debugtext').innerHTML = " current X Y "+x+" "+y + " vplayer top left width height" + vTop+" "+vLeft+" "+vWidth+" "+vHeight;
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
                drawingAnnotation.css("top", top+'px');
                drawingAnnotation.css("left", left+'px');
                drawingAnnotation.css("width", width+'px');
                drawingAnnotation.css("height", height+'px');
                drawingAnnotation.on('click', function() {
                    if (drawingAnnotation.is(selectedAnnotation)){
                        deselect_label(selectedAnnotation);
                        selectedAnnotation = null;
                    } else {
                        deselect_label(selectedAnnotation);
                        selectedAnnotation = drawingAnnotation;
                        select_label(drawingAnnotation);
                    }
                });
                $('#video_box').css('cursor', "default");
                drawmode = false;
                mouse_flag = false;
                drawingAnnotation = null
            }
        }
    });


    // resize_canvas()

    // Authenticated DB IAM role: Cognito_ClassroomLabellingSystemAuth_Role
    // Unauthenticated DB IAM role: Cognito_ClassroomLabellingSystemUnauth_Role
    // identity pool id: "us-east-2:4d581a21-bd4a-4f91-a41e-30b8db3397e1"

    // $('#slider').on('input', show_slider_value());
    // $('#myCanvas').css('position', $('#vplayer').css('position'));

    //
    // $('#dltbutton').on('click', function (e) {
    //     var a = 1
    // });
    //

})