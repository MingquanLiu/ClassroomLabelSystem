/* @AUTHOR David Swenarton & Mingquan Liu */

function video_ended() {
    // What you want to do after the event
    document.getElementById("playbutton").innerText = "Play"
}


function show_slider_value() {
    document.getElementById("playbutton").innerText = "Play "
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
    $("#myCanvas").css("position", "relative");
    $("#myCanvas").css("width", $("#vcontainer").width());
    $("#myCanvas").css("height", $("#vcontainer").height());
    $("#myCanvas").css("top", $("#vcontainer").css('top'));
    $("#myCanvas").css("left", $("#vcontainer").css('left'));
    $("#myCanvas").css("right", $("#vcontainer").css('right'));
    $("#myCanvas").css("bottom", $("#vcontainer").css('bottom'));

    var slider = document.getElementById("myRange");
    var output = document.getElementById("demo");

    output.innerHTML = parseFloat(0).toFixed(2) + " / " + $("#vplayer").get(0).duration.toFixed(2)
    slider.value = 0
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


$(document).ready(function() {
    let drawmode = false;

    // Authenticated DB IAM role: Cognito_ClassroomLabellingSystemAuth_Role
    // Unauthenticated DB IAM role: Cognito_ClassroomLabellingSystemUnauth_Role
    // identity pool id: "us-east-2:4d581a21-bd4a-4f91-a41e-30b8db3397e1"

    $('#slider').on('input', show_slider_value);

    $('#myCanvas').css('top', $('#vcontainer').css('top'));
    $('#myCanvas').css('left', $('#vcontainer').css('left'));
    $('#myCanvas').css('bottom', $('#vcontainer').css('bottom'));
    $('#myCanvas').css('right', $('#vcontainer').css('right'));
    $('#myCanvas').css('position', $('#vcontainer').css('position'));

    // $('#drawbutton').on('click', function (e) {
    //     if (drawmode == true) {
    //         drawmode = false;
    //         canvas.style.cursor = "default";
    //         document.getElementById('debugtext').innerHTML = "DRAW MODE OFF";
    //     } else {
    //         drawmode = true;
    //         canvas.style.cursor = "crosshair";
    //         document.getElementById('debugtext').innerHTML = "DRAW MODE ON";
    //     }
    // });
    //
    // $('#dltbutton').on('click', function (e) {
    //     var a = 1
    // });
    //
    // $('#myCanvas').on('click', function (e) {
    //     if (drawmode == true) {
    //         var newAnnotation;
    //         const x = e.pageX;
    //         const y = e.pageY;
    //         document.getElementById('debugtext').innerHTML = "(" + x + ", " + y + ")";
    //         newAnnotation = jQuery('<div/>', {
    //             class: 'annotation',
    //         }).appendTo('#myCanvas');
    //
    //         canvas.style.cursor = "default";
    //         drawmode = false;
    //     }
    // });

    $("#myCanvas").css("border", "3px solid red");
    // resize_canvas();
    $("#vplayer").get(0).on("loadeddata", resize_canvas())
})