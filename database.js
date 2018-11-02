function addAnnotation(videoID, annotatorID, annotation) {
	return 0;
}

function dbToUITransform(annotationTable, xRatio, yRatio){ // XY ratio are currentX/originalX
	let top = annotationTable["top"]
	let left = annotationTable["left"]
	let width = annotationTable["width"]
	let height = annotationTable["height"]
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
    return annotationHtml
}

function UITodbTransform(annotation, xRatio, yRatio, annotatorID){ // XY ratio are currentX/originalX
    let top = parseInt(annotation.css('top'),10)
    let left = parseInt(annotation.css('left'),10)
    let width = parseInt(annotation.css('width'),10)
    let height = parseInt(annotation.css('height'),10)
    top = top / yRatio
    left = left / xRatio
    width = width / xRatio
    height = height / yRatio
	let annotationTable = []
	annotationTable["top"] = top
	annotationTable["left"] = left
	annotationTable["width"] = width
	annotationTable["height"] = height
	annotationTable["annotatorID"] = annotatorID

    return annotationTable
}



