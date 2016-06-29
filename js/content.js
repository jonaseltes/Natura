/// <reference path="three.min.js" />
/// <reference path="OrbitControls.js" />
/// <reference path="w2ui-1.4.2.min.js />
/// <reference path="CCapture.all.min.js />
/// <reference path="tuna.min.js />
/// <reference path="audio.js />

var container;
var camera, controls, scene, renderer, currCam;
var sceneBB, box;
var selectable = [];
var cameras = [];
var flag = 0;
var ui = true;
var rotSpeed = .001;
var capturer;
var canvas;
var lightsGroup;
var time;
var spriteClone;
var go = false;
var treeMat;
var forestSounds;
//var plight;
var trees = [
        0, 1, 2, 3
    ];


detect();

function detect() {

    if (Detector.webgl) {

        window.onload = function () {
            init();
            animate();
        };

    } else {
        var warning = Detector.getWebGLErrorMessage();
        var warningElement = document.getElementById('container');
        if (warningElement === null) {
            warningElement = document.createElement('div');
            warningElement.id = 'container';
            document.body.insertBefore(warningElement, window.document.getElementById('footer'));
        }
        warningElement.appendChild(warning);
    }
}

function init() {

    
    var contentElem = window.document.getElementById('content');
    if (contentElem === null) //no UI mode
    {
        ui = false;
        contentElem = document.createElement('div');
        contentElem.id = 'content';
        document.body.insertBefore(contentElem, window.document.getElementById('footer'));
    }

    //Progress Bar
    // var loaderElem = document.createElement('div');
    // loaderElem.id = 'loader';
    // container = document.createElement('div');
    // container.id = "container";
    // var circle = new ProgressBar.Circle(container, {
    //     color: '#000000',
    //     text: {
    //         value: '0'
    //     },
    //     step: function (state, bar) {
    //         bar.setText((bar.value() * 100).toFixed(0));
    //     }
    // });

    // loaderElem.appendChild(container);
    // document.body.appendChild(loaderElem);
    // loaderElem.style.display = "block";


    forestSounds = document.getElementById("environment");
    //forestSounds.volume = 0.8;
    forestSounds.loop = true;
    // forestSounds.onended = function(){
    //     forestSounds.play();
    // }
    console.log("forestSounds: " ,forestSounds);
    handle_startMonitoring();

    //scene
    scene = new THREE.Scene();

    //render
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        clearColor: 0x000000,
        clearAlpha: 0
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    contentElem.appendChild(renderer.domElement);

    //camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // camera.position.z = 100;
    // camera.position.y = 100;

    camera.up = new THREE.Vector3(0, 0, 1);
    //camera.lookAt(new THREE.Vector3(0, -100, 0));

    //controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.target.set(new THREE.Vector3(0, 0, 50));
    //controls.damping = 0.2;
    controls.update();
    console.log("controls: " ,controls);
    // controls.enabled = false;
    // controls.enableRotate = false;
    controls.enablePan = false;
    // controls.object.position.y = 50;
    //var targetV = new THREE.Vector3(0, 5, 0);
    

    //load assets
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {

        console.log(item, loaded, total);

    };

    var loader = new THREE.ObjectLoader(manager);

    loader.load(
		// resource URL coming from other file
		'data/data_large.json',
		// Function when resource is loaded
		function (result) {
		    scene = result;
            console.log("result: " ,scene);
		    processScene(scene);

		},
		// Function called when download progresses
		function (xhr) {
		    //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );

		    if ((xhr.loaded / xhr.total) < 1) {
		        circle.set(xhr.loaded / xhr.total);
		    }

		    if ((xhr.loaded / xhr.total) == 1) {
		        circle.destroy();

		        container.outerHTML = "";
		        delete container;
		        loaderElem.style.display = "none";

		    }
		},
		// Function called when download errors
		function (xhr) {
		    console.log('An error happened');
		});

    

    //events
    window.addEventListener('resize', onWindowResize, false);
    // window.addEventListener('layerOff', onLayerOff);
    // window.addEventListener('layerOn', onLayerOn);
    window.addEventListener('viewChange', onViewChange);
    // window.addEventListener('viewCapture', onCaptureView);
    window.addEventListener('zoomExtents', onZoomExtent);
    window.addEventListener('zoomSelected', onZoomSelected);


    contentElem.addEventListener('mousedown', function () {
        flag = 0;
    }, false);
    contentElem.addEventListener('mousemove', function () {
        flag = 1;
    }, false);
    contentElem.addEventListener('mouseup', function (e) {
        if (flag === 0) {
            console.log("click");
            onClick(e);
        } else if (flag === 1) {
            console.log("drag");
        }
    }, false);


    document.addEventListener("keydown", pauseAnimaiton, false);

    


    canvas = document.getElementsByTagName("canvas")[0];
    console.log("canvas: " ,canvas);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // capturer = new CCapture( {
    //     framerate: 30,
    //     format: 'webm',
    //     autoSaveTime: 5
    // } );

    
    render();
}


function pauseAnimaiton(e) {
    var keyCode = e.keyCode;
      if(keyCode==32) {
       if (!go) {
        go = true;
       }

       else {
        go = false;
       }

      }

      if(keyCode == 13){
        //capturer.save();
      }
      
}


function mergeMesh(){
    for (i = 0; i < scene.children.length; i++) {
        switch (scene.children[i].type) {
            case "Mesh":
                sceneBB.merge(scene.children[i].geometry);
                break;
        }
    }
}


var lightIndex = 0;

function animateLights(){
    //time = new THREE.Clock(true);

    console.log("lightIndex: " ,lightIndex);
       setTimeout(function () {
        if (lightIndex == 0){
            //console.log("lightsGroup.children.length: " ,lightsGroup.children.length);
            lightsGroup.children[lightsGroup.children.length - 1].children[0].intensity = 0;
            lightsGroup.children[lightsGroup.children.length - 1].children[1].visible = false;
        }

        else {
            lightsGroup.children[lightIndex-1].children[0].intensity = 0;
            lightsGroup.children[lightIndex-1].children[1].visible = false;
        }
            
          lightsGroup.children[lightIndex].children[0].intensity = 8;
            lightsGroup.children[lightIndex].children[1].visible = true;
          console.log("lightsGroup.children[lightIndex].visible: " ,lightsGroup.children[lightIndex].visible);
          lightIndex++;                  
          if (lightIndex == lightsGroup.children.length) {            
               lightIndex = 0;
          }
          render();
          animateLights();                    
       }, 400);

}


function generateLights(positionX, positionY, sprite){
    
    var randomIndex = Math.floor(Math.random() * 4) + 1;
    for (i = 0; i < 1; i++) {
        //var spriteClone = sprite.clone();
        // var plightB = new THREE.PointLight(0x666666, 30, 20, 5);
        // plightB.position.set(0, 0, 15);
        // scene.add(plightB);

        var plight = new THREE.PointLight(0x666666, 10, 10, 1);
        var randomX = Math.floor(Math.random() * 4) - 2;
        var randomY = Math.floor(Math.random() * 4) - 2;
        var randomZ = Math.floor(Math.random() * 3) + 7;
        randomX = positionX + randomX;
        randomY = positionY + randomY;
        plight.position.set(randomX, randomY, randomZ);
        scene.add(plight);

        // spriteClone.position.set(randomX, randomY, randomZ);
        // scene.add(spriteClone);

        // var sphereSize = 1;
        // var pointLightHelper = new THREE.PointLightHelper( plightT, sphereSize );
        // scene.add( pointLightHelper );
    }

    
}

// 0, 1, 4, 6

function generateTrees(numberOfTrees){

    var textureLoader = new THREE.TextureLoader();
    var map = textureLoader.load("textures/circle2.png");
    map.minFilter = THREE.NearestFilter;
    map.magFilter = THREE.NearestFilter;
    var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: map, fog: false } ) );
    sprite.scale.set(4, 4, 1);
    sprite.position.set(-40, 0, 40);
    //scene.add(sprite);
    plight = new THREE.PointLight(0x666666, 10, 40, 2);
    plight.position.set(-40, 0, 40);
    //scene.add(plight);
    lightsGroup = new THREE.Group();
    lightsGroup.add(sprite);
    lightsGroup.add(plight);
    //scene.add(lightsGroup);

    spriteClone = sprite.clone();
    //spriteClone.position.set(plight.position);
    console.log("spriteClone.z = " ,spriteClone.position.z);
    spriteClone.visible = false;
    //scene.add(spriteClone);
    

    var renderedLights = 0;

    for (i = 0; i < numberOfTrees; i++) {
        //console.log("cloning tree nr: " ,i);
        var randomIndex = Math.floor(Math.random() * 4);
        randomIndex = trees[randomIndex];
        var newTree = scene.children[randomIndex].clone();
        var randomX = Math.floor(Math.random() * 200) - 100;
        var randomY = Math.floor(Math.random() * 200) - 100;
        //var randomZ = Math.floor(Math.random() * 4) + 17;
        newTree.position.set(randomX,randomY,0);
        newTree.rotation.z = Math.floor(Math.random() * 100) / 100;
        scene.add(newTree);
        //newTree.visible = false;

        //generateLights(randomX, randomY, sprite);

        var randomNumberOfLights = Math.floor(Math.random() * 3) + 1;
        // for (x = 0; x < randomNumberOfLights; x++) {
        //     var plight = new THREE.PointLight(0x666666, 0, 30, 2);
        //     var randomXLight = newTree.position.x;
        //     var randomYLight = newTree.position.y;
        //     var randomZLight = (Math.random() * 5) + 25;            
        //     plight.position.set(randomXLight, randomYLight, randomZLight);
        //     //scene.add(plight);
        //     renderedLights++;

        //     var spriteClone = sprite.clone();
        //     spriteClone.position.set(randomXLight, randomYLight, randomZLight);
        //     //scene.add(spriteClone);

        //     var currentLightGroup = new THREE.Group();
        //     spriteClone.visible = false;
        //     //plight.intensity = 8;
        //     currentLightGroup.add(plight, spriteClone);
        //     //currentLightGroup.visible = true;
        //     lightsGroup.add(currentLightGroup);
        //     // var sphereSize = 1;
        //     // var pointLightHelper = new THREE.PointLightHelper( plightT, sphereSize );
        //     // scene.add( pointLightHelper );
        // }

    }

    //scene.add(lightsGroup);
    //mergeMesh();
    //lightsGroup.children[6].visible = true; 
    //animateLights();
    //setTimeout(function(){ capturer.start(); }, 3000);
    
}

function processScene(scene) {

    sceneBB = new THREE.Geometry(); //for computing the scene BB
    var mesh = null;
    treeMat = new THREE.MeshPhongMaterial({
                  color      :  new THREE.Color("rgb(10,10,10)"),
                  emissive   :  new THREE.Color("rgb(50,50,50)"),
                  specular   :  new THREE.Color("rgb(250,250,250)"),
                  shininess  :  5,
                  shading    :  THREE.FlatShading,
                  transparent: true,
                  opacity    : 1,
                  fog        : true
                });

    var normMat = new THREE.MeshNormalMaterial( { opacity: 1, transparent: true, fog: true} );

    console.log("children: " ,scene.children);

    for (i = 0; i < scene.children.length; i++) {

        var child = scene.children[i];
        //scene.children.length


        //console.log("scene.children[i]: " ,scene.children[i].type);

        switch (scene.children[i].type) {
            case "Line":

                // sceneBB.merge(scene.children[i].geometry);
                // selectable.push(scene.children[i]);
                // addLayer(scene.children[i]);
                scene.remove(scene.children[i]);

                break;

            case "Points":
            case "PointCloud":

                // selectable.push(scene.children[i]);
                // addLayer(scene.children[i]);

                scene.remove(scene.children[i]);

                break;

            case "Mesh":

                // sceneBB.merge(scene.children[i].geometry);
                // selectable.push(scene.children[i]);
                // addLayer(scene.children[i]);

                //mesh = new THREE.Mesh(scene.children[i].geometry);
                scene.children[i].receiveShadows = true;
                if (i == 6) {
                    scene.children[i].scale.set(4,4,4);
                }

                if (i == 0 || i == 1 || i == 2 || i == 3 || i == 4){
                    //scene.children[i].material = treeMat;
                }

                // if (i == 5) {
                //     scene.children[i].material = normMat;
                // }
                //scene.add(scene.children[i]);

                break;

            case "DirectionalLight":

                console.log("DirectionalLight: " ,scene.children[i]);
                scene.children[i].castShadow = true;
                // scene.children[i].shadowMapWidth = 4096;
                // scene.children[i].shadowMapHeight = 4096;
                sceneBB.computeBoundingSphere();
                // child.position.z = 50;
                // child.position.y = 50;
                // child.position.x = 50;

                var d = sceneBB.boundingSphere.radius;

                // scene.children[i].shadowCameraLeft = -d;
                // scene.children[i].shadowCameraRight = d;
                // scene.children[i].shadowCameraTop = d;
                // scene.children[i].shadowCameraBottom = -d;

                // scene.children[i].shadowCameraNear = 10;
                // scene.children[i].shadowCameraFar = d * 2;

                // scene.children[i].shadowDarkness = 0.2;
                // scene.children[i].shadowBias = -0.00001;
                scene.children[i].intensity = 0.5;

                scene.remove(scene.children[i]);

                break;

            case "SpotLight":
                // console.log("SpotLight: " ,scene.children[i]);
                scene.children[i].castShadow = true;
                // //also need to add spotlight parameters

                //scene.remove(scene.children[i]);

                break;

            case "PerspectiveCamera":

                // cameras.push(scene.children[i]);

                // //add to views

                // var divID = scene.children[i].name.split(' ').join('_');

                // if (!document.getElementById(divID)) {

                //     var data = {
                //         detail: {
                //             viewName: scene.children[i].name,
                //             viewID: divID
                //         }
                //     };

                //     window.dispatchEvent(new CustomEvent('add-view', data));
                // }

                break;

            case "Group":

                // selectable.push(scene.children[i]);
                // addLayer(scene.children[i]);

                // var gBBox = new THREE.BoundingBoxHelper(scene.children[i], 0x888888);
                // gBBox.update();
                // sceneBB.mergeMesh(gBBox);

                scene.remove(scene.children[i]);

                break;

            default:

                break;
        }
    }

    console.log("sceneBB: " ,sceneBB);

    // var light = new THREE.AmbientLight(0x808080); // soft white light
    // scene.add(light);

    //point lights
    sceneBB.computeBoundingSphere();
    var bbcenter = sceneBB.boundingSphere.center;
    var bbradius = sceneBB.boundingSphere.radius * 2;

    // var plightN = new THREE.PointLight(0x666666, 0.33, 0);
    // plightN.position.set(bbcenter.x, bbcenter.y + bbradius, bbcenter.z);
    // scene.add(plightN);

    // var plightT = new THREE.PointLight(0x666666, 1, 0);
    // plightT.position.set(bbcenter.x, bbcenter.y, bbcenter.z + bbradius);
    // scene.add(plightT);


    // var plightB = new THREE.PointLight(0x666666, 30, 20, 5);
    // plightB.position.set(0, 0, 15);
    // scene.add(plightB);


    // var sphereSize = 5;
    // var pointLightHelper = new THREE.PointLightHelper( plightB, sphereSize );
    // scene.add( pointLightHelper );

    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    scene.fog = new THREE.Fog( 0xdddddd, 15, 150 );
    generateTrees(40);


    //deal with cameras and controls

    // camera = new THREE.PerspectiveCamera(cameras[cameras.length - 1].fov, window.innerWidth / window.innerHeight, cameras[cameras.length - 1].near, cameras[cameras.length - 1].far);
    // camera.position.copy(cameras[cameras.length - 1].position);
    // camera.rotation.copy(cameras[cameras.length - 1].rotation);
    // camera.up = new THREE.Vector3(0, 0, 1);

    //controls.object = camera;
    //controls.target.set(cameras[cameras.length - 1].userData[0].tX, cameras[cameras.length - 1].userData[0].tY, cameras[cameras.length - 1].userData[0].tZ);
    // controls.object.position.z = 150;
    // controls.target.set(0, 30, 0);
    //controls.lookAt(0, 30, 0);

    //currCam = cameras[cameras.length - 1].name;

    processLayers(scene.userData[1]);

    var report = new Function("num", scene.userData[0].ga)();
    report(scene.children.length);

    //console.log(scene);
    controls.object.position.y = 100;
    //controls.object.position.z = 30;
    controls.target.set(scene.position.x, scene.position.y, scene.position.z+50);
}

function processLayers(layerInfo) {

    for (var key in layerInfo) {
        var divID = key.split(' ').join('_');
        if (!layerInfo[key]) {
            var data = {
                detail: {
                    layer: key,
                    state: layerInfo[key],
                    'divID': divID
                }
            };
            window.dispatchEvent(new CustomEvent('layerOff', data));

            if (ui)
                w2ui[divID].onSetState(data);

        }
    }

}

function addLayer(child) {

    var divID = child.userData[0].Layer.split(' ').join('_');

    if (!document.getElementById(divID)) {

        var data = {
            detail: {
                layer: child.userData[0].Layer
            }
        };

        window.dispatchEvent(new CustomEvent('add-layer', data));
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log("Window Resize!");
    render();
}

function onLayerOff(event)
{

    for (var i = 0; i < scene.children.length; i++) {

        if (scene.children[i].userData[0] !== undefined && event.detail.layer == scene.children[i].userData[0].Layer) {

            scene.children[i].visible = false;

            if (scene.children[i].userData[0].Selected) {

                scene.remove(scene.getObjectById(scene.children[i].userData[0].BBoxId));
                scene.children[i].userData[0].Selected = false;
                scene.children[i].userData[0].BBoxId = null;

            }
        }
    }
}

function onLayerOn(event) {

    for (var i = 0; i < scene.children.length; i++) {

        if (scene.children[i].userData[0] !== undefined && event.detail.layer == scene.children[i].userData[0].Layer) {

            scene.children[i].visible = true;

        }
    }
}

function onCaptureView(event) {

    var imgData, imgNode;

    try {
        imgData = renderer.domElement.toDataURL("image/png");
        imgNode = window.open(imgData, "_blank");
        imgNode.focus();
        console.log(imgData);
    } catch (e) {
        console.log("Browser does not support taking screenshot of 3d context");
        return;
    }

}

function onViewChange(event) {
    console.log("view change: " ,event);
    var cam = scene.getObjectByName(event.detail.view);
    controls.object.position.set(cam.position.x, cam.position.y, cam.position.z);
    controls.target.set(cam.userData[0].tX, cam.userData[0].tY, cam.userData[0].tZ);
}

function onZoomExtent(event) {
    console.log("zoomExtent: " ,event);
    var boundingSphere = sceneBB.boundingSphere;
    var center = boundingSphere.center;
    var radius = boundingSphere.radius;
    var offset = radius / Math.tan(Math.PI / 180.0 * controls.object.fov * 0.5);
    var vector = new THREE.Vector3(0, 0, 1);
    var viewDir = vector.applyQuaternion(controls.object.quaternion);
    var viewPos = new THREE.Vector3();
    viewDir.multiplyScalar(offset * 1.25);
    viewPos.addVectors(center, viewDir);
    controls.object.position.set(viewPos.x, viewPos.y, viewPos.z);
    controls.target.set(center.x, center.y, center.z);

}

function onZoomSelected(event) {

    console.log("zoom selected: " ,event);

    var selectedBB = new THREE.Geometry();
    var cntSelected = 0;
    for (i = 0; i < scene.children.length; i++) {
        if (scene.children[i].userData[0] !== undefined && scene.children[i].userData[0].Selected === true) {

            var selBBox = new THREE.BoundingBoxHelper(scene.children[i], 0x888888);
            selBBox.update();
            selectedBB.mergeMesh(selBBox);

            cntSelected++;
        }
    }

    if (cntSelected === 0) return;

    selectedBB.computeBoundingSphere();

    var boundingSphere = selectedBB.boundingSphere;
    var center = boundingSphere.center;
    var radius = boundingSphere.radius;
    var offset = radius / Math.tan(Math.PI / 180.0 * controls.object.fov * 0.5);
    var vector = new THREE.Vector3(0, 0, 1);
    var viewDir = vector.applyQuaternion(controls.object.quaternion);
    var viewPos = new THREE.Vector3();
    viewDir.multiplyScalar(offset * 1.25);
    viewPos.addVectors(center, viewDir);
    controls.object.position.set(viewPos.x, viewPos.y, viewPos.z);
    controls.target.set(center.x, center.y, center.z);
    controls.target.set(lightsGroup.position.x, lightsGroup.position.y, lightsGroup.position.z-20);
}

function onClick(event) {

    forestSounds.play();

    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);

    vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(selectable, true);

    if (intersects.length > 0) {

        console.log(intersects[0]);

        var tmpElement = null;

        if (intersects[0].object.parent.type == "Group") {

            //find last parent
            tmpElement = getSceneParent(intersects[0].object);

        } else {

            tmpElement = intersects[0].object;
        }

        if (tmpElement.userData[0].Selected === true) {

            //delesect
            scene.remove(scene.getObjectById(tmpElement.userData[0].BBoxId));
            tmpElement.userData[0].Selected = false;
            tmpElement.userData[0].BBoxId = null;

        } else {

            //select
            var bbox = new THREE.BoxHelper(tmpElement);
            tmpElement.userData[0].BBoxId = bbox.id;
            tmpElement.userData[0].Selected = true;
            scene.add(bbox);

        }

    } else {
        //deselect all
        for (var s = 0; s < selectable.length; s++) {
            if (selectable[s].userData[0].Selected === true) {
                scene.remove(scene.getObjectById(selectable[s].userData[0].BBoxId));
                selectable[s].userData[0].Selected = false;
                selectable[s].userData[0].BBoxId = null;
            }
        }
    }
}

function getSceneParent(obj) {
    if (obj.parent.type != 'Scene') {
        return getSceneParent(obj.parent);
    } else {
        return obj;
    }
}


function checkRotation(){

    var x = camera.position.x,
        y = camera.position.y,
        z = camera.position.z;

    // if (keyboard.pressed("left")){ 
    //     camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
    //     camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
    // } else if (keyboard.pressed("right")){
        camera.position.y = y * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
        camera.position.x = x * Math.cos(rotSpeed) + y * Math.sin(rotSpeed);
    //}
    
    //camera.lookAt(scene.position);
    //camera.lookAt(0, 50, 50);
    //camera.lookAt(scene.position.x, scene.position.y, scene.position.z);
    
} 


function animate() {

    requestAnimationFrame(animate);

    if (go) {
        spriteClone.position.x += 0.2;
        lightsGroup.position.x += 0.2;
    }

    else {
        spriteClone.position.x -= 0.2;
        lightsGroup.position.x -= 0.2;
    }
    
    //lightsGroup.position.y += Math.random() * 0.2;
    lightsGroup.position.z -= (Math.floor(Math.random() * 2) - 0.5)/10;
    render();
    controls.update();
    //controls.target.set(spriteClone.position.x+20, spriteClone.position.y, spriteClone.position.z);
    // controls.target.set(controls.target.x+0.12, lightsGroup.position.y, spriteClone.position.z);
    // camera.lookAt(spriteClone.position);
    //camera.position.x += 0.2;
    // camera.position.y += 0.2;
    //camera.position.distanceTo(lightsGroup.position);
    checkRotation();
    
}

function render() {
    renderer.render(scene, camera);
    //capturer.capture( canvas );
}
