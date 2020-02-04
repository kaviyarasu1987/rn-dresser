import React from 'react';
import { Text, View, Image, TouchableOpacity, TouchableHighlight, StyleSheet, Alert, WebView, Button,Slider,Platform } from 'react-native';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import { captureScreen } from "react-native-view-shot";
import { Paint } from './jspaint';
import { MultiSelect } from './multiselect';
import * as ImageManipulator from 'expo-image-manipulator';

export default class DresserMale extends React.Component {
    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.front,
        imageuri: " ",
        panturi: " ",
        shirtCapture: "Try Shirt",
        pantCapture: "Try Pant",
        brush1: "black",
        brush2: "black",
        brush3: "black",
        brush4: "black",
        brush5: "green",
        action:JSON.parse('{"name":"brush","value":"10"}'),
        selectedItem : null,
        data: [{key:"key1", label:"label1"}, {key:"key2", label:"label2"}]
    };

    handleColor(brush1, brush2, brush3, brush4, brush5) {
        this.setState({
            brush1: brush1,
            brush2: brush2,
            brush3: brush3,
            brush4: brush4,
            brush5: brush5
        })
        
        let actionObject = this.state.action;
        if (brush1 == 'green')
        {   
            actionObject.name = 'rubber' 
            
        }
        else if (brush2 == 'green')
        {
            actionObject.name = 'magic' 
          

        }
        this.sendpostMessage(JSON.stringify(actionObject))
        console.log("value for slider"+JSON.stringify(actionObject));
        this.setState({ action: actionObject });

    }

    rubberThickness(value)
    {
        console.log("value for slider"+value);
        let actionObject = this.state.action;
        actionObject.value = ""+value;
        console.log("value for the JSON "+JSON.stringify(actionObject));
        this.sendpostMessage(JSON.stringify(actionObject));
        this.setState({ action: actionObject });
        
            


    }

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    onMessage(event) {

        console.log(event);

    }

    sendpostMessage(dataToSend) {

        this.webview.postMessage(dataToSend)

    }

    captureAndSend = async () => {
        if (this.camera) {
            let photo = await this.camera.takePictureAsync({
                base64: true,
                exif: true
            });
            if(Platform.OS == 'ios')
            photo = await ImageManipulator.manipulateAsync(photo.uri, [{
                rotate: 0
            },


            {
                resize: {
                    width: photo.width,
                    height: photo.height
                }
            }], {
                compress: 1,
                base64: true
            });

           
            this.sendpostMessage(photo.base64);
            this.setState({ type: Camera.Constants.Type.back });

        }

    }

    resetToPreviousBehaviour() {
        let actionObject = this.state.action;
        actionObject.name = "reset";
        this.sendpostMessage(JSON.stringify(actionObject));


    }

    undoToPreviousBehaviour() {
        let actionObject = this.state.action;
        actionObject.name = "undo";
        this.sendpostMessage(JSON.stringify(actionObject));


    }


    render() {
        const { hasCameraPermission } = this.state;

        const styles = StyleSheet.create({
            container: {
                flex: 1
            },
            box1: {
                position: 'absolute',
                flex: 0.5,
                flexDirection: "row",
                top: 40,
                left: 40,

                backgroundColor: 'red'
            },
            box2: {
                position: 'absolute',
                flex: 1,
                flexDirection: "row",
                top: 80,
                left: 80,

                backgroundColor: 'blue'

            },
            box3: {
                position: 'absolute',
                flex: 0.5,
                flexDirection: "row",
                top: 120,
                left: 120,

                backgroundColor: 'green'
            },
            text: {
                color: '#ffffff',
                fontSize: 80
            }
        });
        var imageURL = "";
        var shirtimageURL = " ";
        const html = `<html style="background-color: transparent;">

        <head>
        <script src="https://code.jquery.com/jquery-1.7.2.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.13.3"></script> 
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix"></script> 

        </head>
        
        <body style="background-color: transparent;">
            <h2 id="head">for heading</h2>
                <canvas id="canvas" style='border: 1px solid black; background-color: transparent;'></canvas>
               
              
        
            <script>
                (function() {

                    var rubberIndex=1;
                    var thickness=5;
                    var floodFillPoints;
                    var imageBackup;
                    var magicPoints = [];
                    var imageHistory = [];
                    var rubberPoints = [];
                    var rubberPointsOverall = []; 
                    var isinitial = true;
                    var lastPrediction;
                    MagicWand = (function () {
                        var lib = {};
                    
                        
                        lib.floodFill = function(image, px, py, colorThreshold, mask, includeBorders) {
                            return includeBorders
                                ? floodFillWithBorders(image, px, py, colorThreshold, mask)
                                : floodFillWithoutBorders(image, px, py, colorThreshold, mask);
                        };
                    
                        function floodFillWithoutBorders(image, px, py, colorThreshold, mask) {
                    
                            var c, x, newY, el, xr, xl, dy, dyl, dyr, checkY,
                                data = image.data,
                                w = image.width,
                                h = image.height,
                                bytes = image.bytes,
                                maxX = -1, minX = w + 1, maxY = -1, minY = h + 1,
                                i = py * w + px, 
                                result = new Uint8Array(w * h), 
                                visited = new Uint8Array(mask ? mask : w * h); 
                    
                            if (visited[i] === 1) return null;
                    
                            i = i * bytes; 
                            var sampleColor = [data[i], data[i + 1], data[i + 2], data[i + 3]]; 
                    
                            var stack = [{ y: py, left: px - 1, right: px + 1, dir: 1 }]; 
                            do {
                                el = stack.shift(); 
                    
                                checkY = false;
                                for (x = el.left + 1; x < el.right; x++) {
                                    dy = el.y * w;
                                    i = (dy + x) * bytes; 
                    
                                    if (visited[dy + x] === 1) continue; 
                                   
                                    c = data[i] - sampleColor[0]; 
                                    if (c > colorThreshold || c < -colorThreshold) continue;
                                    c = data[i + 1] - sampleColor[1]; 
                                    if (c > colorThreshold || c < -colorThreshold) continue;
                                    c = data[i + 2] - sampleColor[2]; 
                                    if (c > colorThreshold || c < -colorThreshold) continue;
                    
                                    checkY = true;  
                    
                                    result[dy + x] = 1; 
                                    visited[dy + x] = 1;
                    
                                    xl = x - 1;
                                    
                                    while (xl > -1) {
                                        dyl = dy + xl;
                                        i = dyl * bytes; 
                                        if (visited[dyl] === 1) break; 
                                        
                                        c = data[i] - sampleColor[0]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 1] - sampleColor[1]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 2] - sampleColor[2]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                    
                                        result[dyl] = 1;
                                        visited[dyl] = 1;
                    
                                        xl--;
                                    }
                                    xr = x + 1;
                                    
                                    while (xr < w) {
                                        dyr = dy + xr;
                                        i = dyr * bytes; 
                                        if (visited[dyr] === 1) break; 
                                        c = data[i] - sampleColor[0]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 1] - sampleColor[1]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 2] - sampleColor[2]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                    
                                        result[dyr] = 1;
                                        visited[dyr] = 1;
                    
                                        xr++;
                                    }
                    
                                    
                                    if (xl < minX) minX = xl + 1;
                                    if (xr > maxX) maxX = xr - 1;
                    
                                    newY = el.y - el.dir;
                                    if (newY >= 0 && newY < h) { 
                                        if (xl < el.left) stack.push({ y: newY, left: xl, right: el.left, dir: -el.dir }); 
                                        if (el.right < xr) stack.push({ y: newY, left: el.right, right: xr, dir: -el.dir }); 
                                    }
                                    newY = el.y + el.dir;
                                    if (newY >= 0 && newY < h) { 
                                        if (xl < xr) stack.push({ y: newY, left: xl, right: xr, dir: el.dir }); 
                                    }
                                }
                                
                                if (checkY) {
                                    if (el.y < minY) minY = el.y;
                                    if (el.y > maxY) maxY = el.y;
                                }
                            } while (stack.length > 0);
                    
                            return {
                                data: result,
                                width: image.width,
                                height: image.height,
                                bounds: {
                                    minX: minX,
                                    minY: minY,
                                    maxX: maxX,
                                    maxY: maxY
                                }
                            };
                        };
                    
                        function floodFillWithBorders(image, px, py, colorThreshold, mask) {
                    
                            var c, x, newY, el, xr, xl, dy, dyl, dyr, checkY,
                                data = image.data,
                                w = image.width,
                                h = image.height,
                                bytes = image.bytes, 
                                maxX = -1, minX = w + 1, maxY = -1, minY = h + 1,
                                i = py * w + px, 
                                result = new Uint8Array(w * h), 
                                visited = new Uint8Array(mask ? mask : w * h); 
                    
                            if (visited[i] === 1) return null;
                    
                            i = i * bytes; 
                            var sampleColor = [data[i], data[i + 1], data[i + 2], data[i + 3]]; 
                    
                            var stack = [{ y: py, left: px - 1, right: px + 1, dir: 1 }];
                            do {
                                el = stack.shift(); 
                    
                                checkY = false;
                                for (x = el.left + 1; x < el.right; x++) {
                                    dy = el.y * w;
                                    i = (dy + x) * bytes; 
                    
                                    if (visited[dy + x] === 1) continue; 
                    
                                    checkY = true;  
                    
                                    result[dy + x] = 1; 
                                    visited[dy + x] = 1; 
                    
                                    
                                    c = data[i] - sampleColor[0]; 
                                    if (c > colorThreshold || c < -colorThreshold) continue;
                                    c = data[i + 1] - sampleColor[1]; 
                                    if (c > colorThreshold || c < -colorThreshold) continue;
                                    c = data[i + 2] - sampleColor[2]; 
                                    if (c > colorThreshold || c < -colorThreshold) continue;
                    
                                    xl = x - 1;
                                    
                                    while (xl > -1) {
                                        dyl = dy + xl;
                                        i = dyl * bytes; 
                                        if (visited[dyl] === 1) break; 
                    
                                        result[dyl] = 1;
                                        visited[dyl] = 1;
                                        xl--;
                    
                                        
                                        c = data[i] - sampleColor[0]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 1] - sampleColor[1]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 2] - sampleColor[2]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                    }
                                    xr = x + 1;
                                    
                                    while (xr < w) {
                                        dyr = dy + xr;
                                        i = dyr * bytes; 
                                        if (visited[dyr] === 1) break; 
                    
                                        result[dyr] = 1;
                                        visited[dyr] = 1;
                                        xr++;
                    
                                       
                                        c = data[i] - sampleColor[0]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 1] - sampleColor[1]; 
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                        c = data[i + 2] - sampleColor[2];
                                        if (c > colorThreshold || c < -colorThreshold) break;
                                    }
                    
                                    
                                    if (xl < minX) minX = xl + 1;
                                    if (xr > maxX) maxX = xr - 1;
                    
                                    newY = el.y - el.dir;
                                    if (newY >= 0 && newY < h) { 
                                        if (xl < el.left) stack.push({ y: newY, left: xl, right: el.left, dir: -el.dir }); 
                                        if (el.right < xr) stack.push({ y: newY, left: el.right, right: xr, dir: -el.dir }); 
                                    }
                                    newY = el.y + el.dir;
                                    if (newY >= 0 && newY < h) { 
                                        if (xl < xr) stack.push({ y: newY, left: xl, right: xr, dir: el.dir }); 
                                    }
                                }
                                
                                if (checkY) {
                                    if (el.y < minY) minY = el.y;
                                    if (el.y > maxY) maxY = el.y;
                                }
                            } while (stack.length > 0);
                    
                            return {
                                data: result,
                                width: image.width,
                                height: image.height,
                                bounds: {
                                    minX: minX,
                                    minY: minY,
                                    maxX: maxX,
                                    maxY: maxY
                                }
                            };
                        };

 lib.gaussBlur = function(mask, radius) {

        var i, k, k1, x, y, val, start, end,
            n = radius * 2 + 1, // size of the pattern for radius-neighbors (from -r to +r with the center point)
            s2 = radius * radius,
            wg = new Float32Array(n), // weights
            total = 0, // sum of weights(used for normalization)
            w = mask.width,
            h = mask.height,
            data = mask.data,
            minX = mask.bounds.minX,
            maxX = mask.bounds.maxX,
            minY = mask.bounds.minY,
            maxY = mask.bounds.maxY;

        // calc gauss weights
        for (i = 0; i < radius; i++) {
            var dsq = (radius - i) * (radius - i);
            var ww = Math.exp(-dsq / (2.0 * s2)) / (2 * Math.PI * s2);
            wg[radius + i] = wg[radius - i] = ww;
            total += 2 * ww;
        }
        // normalization weights
        for (i = 0; i < n; i++) {
            wg[i] /= total;
        }

        var result = new Uint8Array(w * h), // result mask
            endX = radius + w,
            endY = radius + h;

        //walk through all source points for blur
        for (y = minY; y < maxY + 1; y++)
            for (x = minX; x < maxX + 1; x++) {
                val = 0;
                k = y * w + x; // index of the point
                start = radius - x > 0 ? radius - x : 0;
                end = endX - x < n ? endX - x : n; // Math.min((((w - 1) - x) + radius) + 1, n);
                k1 = k - radius;
                // walk through x-neighbors
                for (i = start; i < end; i++) {
                    val += data[k1 + i] * wg[i];
                }
                start = radius - y > 0 ? radius - y : 0;
                end = endY - y < n ? endY - y : n; // Math.min((((h - 1) - y) + radius) + 1, n);
                k1 = k - radius * w;
                // walk through y-neighbors
                for (i = start; i < end; i++) {
                    val += data[k1 + i * w] * wg[i];
                }
                result[k] = val > 0.5 ? 1 : 0;
            }

        return {
            data: result,
            width: w,
            height: h,
            bounds: {
                minX: minX,
                minY: minY,
                maxX: maxX,
                maxY: maxY
            }
        };
    };

    lib.gaussBlur = function(mask, radius) {

        var i, k, k1, x, y, val, start, end,
            n = radius * 2 + 1, 
            s2 = radius * radius,
            wg = new Float32Array(n), 
            total = 0, 
            w = mask.width,
            h = mask.height,
            data = mask.data,
            minX = mask.bounds.minX,
            maxX = mask.bounds.maxX,
            minY = mask.bounds.minY,
            maxY = mask.bounds.maxY;

        
        for (i = 0; i < radius; i++) {
            var dsq = (radius - i) * (radius - i);
            var ww = Math.exp(-dsq / (2.0 * s2)) / (2 * Math.PI * s2);
            wg[radius + i] = wg[radius - i] = ww;
            total += 2 * ww;
        }
       
        for (i = 0; i < n; i++) {
            wg[i] /= total;
        }

        var result = new Uint8Array(w * h), 
            endX = radius + w,
            endY = radius + h;

       
        for (y = minY; y < maxY + 1; y++)
            for (x = minX; x < maxX + 1; x++) {
                val = 0;
                k = y * w + x; 
                start = radius - x > 0 ? radius - x : 0;
                end = endX - x < n ? endX - x : n; 
                k1 = k - radius;
                
                for (i = start; i < end; i++) {
                    val += data[k1 + i] * wg[i];
                }
                start = radius - y > 0 ? radius - y : 0;
                end = endY - y < n ? endY - y : n; 
                k1 = k - radius * w;
                
                for (i = start; i < end; i++) {
                    val += data[k1 + i * w] * wg[i];
                }
                result[k] = val > 0.5 ? 1 : 0;
            }

        return {
            data: result,
            width: w,
            height: h,
            bounds: {
                minX: minX,
                minY: minY,
                maxX: maxX,
                maxY: maxY
            }
        };
    };
           
    
                         return lib;
                         
                    })(); 
               
                    var magic = function () {
                        
                        if (imageInfo.width>0 && imageInfo.height>0) {
                          var image = {
                            data: imageInfo.data,
                            width: imageInfo.width,
                            height: imageInfo.height,
                            bytes: 4
                          };
                          mask = MagicWand.floodFill(image, downPoint.x, downPoint.y, thickness,undefined,true);
                          mask = MagicWand.gaussBlur(mask,5);
                          
                          floodFillPoints=mask.data;
                       
                          drawInside(1);
                        
                        }
                      };

                     

                    var drawInside = function(selectedIndex)
                    {
                        
                        var points = floodFillPoints;
                        var x, y,
                        w = imageInfo.width,
                        h = imageInfo.height,
                        ctx = imageInfo.context,
                        isFirst =true;  
  
                        ctx.lineCap="butt";
                        ctx.lineJoin="mutter";
                        ctx.lineWidth=1;
                        ctx.beginPath();
     
                        magicPoints.push(floodFillPoints);
  for(var k=0;k<points.length;k++)
    {
      if(points[k]==selectedIndex)
        {
           x = k % imageInfo.width;
          y = k/imageInfo.width;
        
          
          if(isFirst)
            {
              ctx.moveTo(x, y);
              isFirst = false;
            }
        
          ctx.lineTo(x, y);
         
          
        }
      
    }
   
      ctx.globalCompositeOperation = 'destination-out';
      ctx.stroke();
  
  
  

}

        var canvas = document.getElementById('canvas');
        var backCanvas = document.createElement('canvas');
        var backCtx = backCanvas.getContext('2d');
        
        var imageInfo = {
            width: 0,
            height: 0,
            context: canvas.getContext("2d")
          };

        canvas.width = $(document).width()-15;
        canvas.height = $(document).height()-10;   
        backCanvas.width = canvas.width;
        backCanvas.height = canvas.height;

        var ctx = canvas.getContext('2d');
        
        var canvasx = $(canvas).offset().left;
        var canvasy = $(canvas).offset().top;
        var last_mousex = last_mousey = 0;
        var mousex = mousey = 0;
        var mousedown = false;
        var tooltype = 'erase';
        var image = new Image();
        var brushWidth = 10;
        var context;
        image.onload = drawImageActualSize;
        
        
    

        document.addEventListener("message", function (event) {
            
            $("#head").text('ssdfsddfd');
            if(!isNaN(event.data))
            {
               
                brushWidth = event.data;
                context.lineWidth = parseInt(event.data);
            }
            else if(isJson(event.data))
            {
                var messgeObject = JSON.parse(event.data);
                if(messgeObject.name=='rubber' || messgeObject.name=='magic')
                {

                    if(messgeObject.name=='rubber')
                    {
                    rubberIndex = 0;
                    brushWidth = parseInt(messgeObject.value);
                    context.lineWidth = parseInt(messgeObject.value);
                    }
                   else if(messgeObject.name=='magic')
                    {
                       
                    rubberIndex = 1;
                    }

                  

                    thickness = parseInt(messgeObject.value);
                }
                else if(messgeObject.name=='reset')
                {
                  
                    reset();  

                }
                else if(messgeObject.name=='undo')
                {
                   
                    undo();

                }

            }
            else
            {
                if(!imageBackup)
                {
                    image.src='data:image/jpg;base64,'+event.data;
                    imageBackup='data:image/jpg;base64,'+event.data;
                }
                else
                {
                    var topImage = canvas.toDataURL('image/png');
                    refreshCanvas('data:image/jpg;base64,'+event.data);
                    implementImage(topImage);
                    

                    
                }
         
            }
         
        }); 
        
        function initiateListeners()
        {
        $('#canvas').on('click', function (e) {
            if(rubberIndex==1)
            {
              
              var p = $(e.target).offset(),
                  x = Math.round((e.clientX || e.pageX) - p.left),
                  y = Math.round((e.clientY || e.pageY) - p.top);    
              downPoint = { x: x, y: y };    
              magic();
             imageHistory.push(canvas.toDataURL('image/png'));
              
            }
            });
        
        canvas.addEventListener('touchstart', function (e) {
         var xyPoints ={};

         rubberPoints = [];         
        if(rubberIndex==0)
        {
            last_mousex = mousex = parseInt(e.touches[0].clientX - canvasx);
            last_mousey = mousey = parseInt(e.touches[0].clientY - canvasy);
            xyPoints.x=last_mousex;
            xyPoints.y=last_mousey;
            xyPoints.brushWidth = brushWidth;
            xyPoints.tooltype = tooltype;
            rubberPoints.push(xyPoints);
            mousedown = true;

        }
        });
        
        
        canvas.addEventListener('touchend', function (e) {
           
            if(rubberIndex==0)
            {    
            mousedown = false;
            imageHistory.push(canvas.toDataURL('image/png'));


            }
            
        

        });
        
        
        canvas.addEventListener('touchmove', function (e) {
            if(rubberIndex==0)
            {
                var xyPoints ={};                
        mousex = parseInt(e.touches[0].clientX - canvasx);
        mousey = parseInt(e.touches[0].clientY - canvasy);
        if (mousedown) {
        context = ctx;
        ctx.beginPath();
        if (tooltype == 'draw') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = brushWidth;
        } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = brushWidth;
        }
        ctx.moveTo(last_mousex, last_mousey);
        xyPoints.x = mousex;
        xyPoints.y = mousey;
        xyPoints.brushWidth = brushWidth; 
        xyPoints.tooltype = tooltype;
        rubberPoints.push(xyPoints);
        ctx.lineTo(mousex, mousey);
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.stroke();
        }
        last_mousex = mousex;
        last_mousey = mousey;
        
    }
        });
    }

        initiateListeners();
        
        use_tool = function (tool) {
          tooltype = tool;
        }
        
        function drawImageActualSize() {
          
            imageInfo.width = $(document).width()-10;
            imageInfo.height = $(document).height()-20;
            ctx.drawImage(this, 0, 0, this.width, this.height,0,0,$(document).width()-10,$(document).height()-20);
            $("#head").text('sdfd');
            imageInfo.data = ctx.getImageData(0, 0, imageInfo.width, imageInfo.height).data;
            imageBackup=canvas.toDataURL('image/png');
            loadAndPredict(this);


        }
        function isJson(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        function undo()
        {
            
           
            refreshCanvas(imageBackup);
            redrawItAll();
          
            
          

        }

        function reset()
        {
            
            refreshCanvas(imageBackup);
          
          

        }

        function refreshCanvas(imageStr)
        {
            $('#canvas').remove();
            var canvasElement = $('<canvas id="canvas" style="border: 1px solid black; background-color: transparent;"></canvas>');
            canvasElement.appendTo('body');
            canvas = document.getElementById('canvas');
            canvas.width = $(document).width()-15;
            canvas.height = $(document).height()-10;
            ctx = canvas.getContext('2d');
            canvasx = $(canvas).offset().left;
            canvasy = $(canvas).offset().top; 
            imageInfo.context = ctx;
            initiateListeners();
            if(imageStr)
            implementImage(imageStr);

        }
        function implementImage(imageStr)
        {
            var imageB = new Image();
            imageB.src = imageStr;
            imageB.onload = drawImageActualSize;
            

        }

        function redrawItAll()
        {
           
            
            if(imageHistory.length>0)
                refreshCanvas(imageHistory[imageHistory.length-2]);

        }

        async function loadAndPredict(image) {
            const net = await bodyPix.load();
            const segmentation = await net.segmentPersonParts(image, {
            flipHorizontal: false,
            internalResolution: 'medium',
            segmentationThreshold: 0.7
      });
            lastPrediction = segmentation;
          }

        function  redrawRubber()
        {
            rubberPointsOverAll = rubberPointsOverAll.pop()
            if(rubberPointsOverAll.length>0)
            for(var j=0;j<rubberPointsOverAll.length;j++)
        {
            var rubberPoints=rubberPointsOverAll[j];
            for(var i=0;i<rubberPoints.length;i++)
        {
            if(i==0)
            {
                last_mousex = rubberPoints[i].x;
                last_mousey = rubberPoints[i].y;

            }

    else{
            mousex = rubberPoints[i].x;
            mousey = rubberPoints[i].y;
            tooltype = rubberPoints[i].tooltype;
            brushWidth = rubberPoints[i].brushWidth;
            context = ctx;
            ctx.beginPath();
            if (tooltype == 'draw') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = brushWidth;
            } else {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = brushWidth;
            }
            ctx.moveTo(last_mousex, last_mousey);
          
            ctx.lineTo(mousex, mousey);
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.stroke();
            last_mousex = mousex;
            last_mousey = mousey;
            }
            

        }   
        }

        }


        }());
            </script>
        </body>
        
        </html>`;
        if (hasCameraPermission === null) {
            return <View />;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            return (

                <View style={{ flex: 1 }}
                    ref={ref => {
                        this.parentView = ref;
                    }}
                >
                    <Camera
                        ref={ref => {
                            this.camera = ref;
                        }}
                        style={{
                            flex: 0.85,
                            flexDirection: 'column'

                        }} type={this.state.type}>


                        <WebView

                            source={{ html: html }}
                            useWebKit={true}
                            scrollEnabled={false}
                            style={{
                                flex: 1,
                                flexDirection: "column",
                                backgroundColor: 'transparent'

                            }}
                            ref={ref => {
                                this.webview = ref
                            }}
                            javaScriptEnabledAndroid={true}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            onMessage={this.onMessage} />



                        

                    </Camera>

                    <View
                            style={{

                                flex:0.15,
                                flexDirection: "column",
                                left: 0,
                                bottom:0,
                                backgroundColor: 'transparent',
                                zIndex: 3

                            }}>
                            <View
                                style={{
                                    flex: 1,
                                    flexDirection: "column"

                                }}
                            >
                                <View
                                    style={{

                                        flexDirection: "row",
                                        width: '100%',
                                        justifyContent: "space-between"

                                    }}
                                >

                                    <View
                                        style={{

                                            flexDirection: "row",
                                            width: '100%',
                                            justifyContent: "space-between"

                                        }}
                                    >
                                        <TouchableHighlight
                                            style={{
                                                width: '40%',
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: this.state.brush1


                                            }}


                                        >

                                            <TouchableHighlight
                                                style={{

                                                    height: 50,
                                                    width: '100%',

                                                    backgroundColor: 'red'

                                                }}

                                                onPress={() => this.handleColor('green', 'black', 'black', 'black', 'black')}


                                            >

                                                <View
                                                    flexDirection='row'
                                                    style={{
                                                        margin: '2%',
                                                        justifyContent: 'space-around'

                                                    }}
                                                >
                                                    <TouchableHighlight
                                                        style={{

                                                            backgroundColor: this.state.brush1
                                                        }}
                                                        onPress={() => this.handleColor('green', 'black', 'black', 'black', 'black')}
                                                    >
                                                        <Image
                                                            source={require('./rubberrem.png')}

                                                        ></Image>
                                                    </TouchableHighlight>

                                                    <TouchableHighlight
                                                        style={{

                                                            backgroundColor: this.state.brush2
                                                        }}

                                                        onPress={() => this.handleColor('black', 'green', 'black', 'black', 'black')}
                                                    >
                                                        <Image
                                                            source={require('./magicrem.png')}
                                                        ></Image>
                                                    </TouchableHighlight>

                                                    <MultiSelect 
                                                    data={this.state.data} 
                                                    selectedItems={this.state.selectedItem} 
                                                    onValueChange={ (itemValue) => thisObj.setState({selectedItem: itemValue})}/>

                                                </View>


                                            </TouchableHighlight>

                                        </TouchableHighlight>

                                        <TouchableHighlight
                                            style={{
                                                width: '60%',
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: this.state.brush2


                                            }}
                                            onPress={() => this.handleColor('green', 'black', 'black', 'black', 'black')}
                                        >

                                            <TouchableHighlight
                                                style={{
                                                    margin: 2,
                                                    height: 40,
                                                    width: '100%',
                                                    borderRadius: 40,
                                                    backgroundColor: 'red'

                                                }}
                                                onPress={() => this.handleColor('black', 'green', 'black', 'black', 'black')}
                                            >


                                                <View
                                                    style={{
                                                        width: '100%',
                                                        flex: 1,
                                                        alignSelf: 'stretch'

                                                    }}
                                                >

                                                    <Slider
                                                        style={{ flexDirection: 'row', width: '100%' }}
                                                        value={this.state.value}
                                                        onValueChange={this.rubberThickness.bind(this)}
                                                        minimumValue={2}
                                                        maximumValue={25}

                                                    />


                                                </View>

                                            </TouchableHighlight>

                                        </TouchableHighlight>



                                    </View>






                                </View>

                                <View
                                    style={{

                                        flexDirection: "row",
                                        justifyContent: "space-around"

                                    }}

                                >



                                    <Button
                                        title="Camera"
                                        onPress={this.captureAndSend}
                                    >


                                    </Button>
                                    <Button
                                        title="Upload"
                                        onPress={this.captureAndSend}
                                    >


                                    </Button>

                                    <Button
                                        title="Reset"
                                        onPress={this.resetToPreviousBehaviour.bind(this)}
                                    >


                                    </Button>
                                    <Button
                                        title="Undo"
                                        onPress={this.undoToPreviousBehaviour.bind(this)}
                                    >


                                    </Button>




                                </View>


                            </View>


                        </View>





                </View>
            );
        }
    }


} 