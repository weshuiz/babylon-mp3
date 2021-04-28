function createScene() {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Black();
    
    const camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(15, 1, -40), scene);
    camera.attachControl(canvas, true);
    camera.upperBetaLimit = Math.PI / 2;
	camera.lowerRadiusLimit = 4;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    //const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);

    var mirror = BABYLON.Mesh.CreateBox("Mirror", 1.0, scene);
    mirror.scaling = new BABYLON.Vector3(100.0, 0.01, 100.0);
    mirror.material = new BABYLON.StandardMaterial("mirror", scene);
    mirror.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    mirror.material.reflectionTexture = new BABYLON.MirrorTexture("mirror", {ratio: 5}, scene, false);
    mirror.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1.0, 0, -2.0);
    //mirror.material.reflectionTexture.renderList = [knot];
    mirror.material.reflectionTexture.level = 0.5;
    mirror.material.reflectionTexture.adaptiveBlurKernel = 16;
    //mirror.reflectionFresnelParameters.bias = 1.02;
	mirror.position = new BABYLON.Vector3(0, -2, 0);

    const music = new BABYLON.Sound("tetris", "./fatrat.mp3", scene, null,
    {
        loop: true,
        autoplay: true,
        volume: 1.00
    });
    const bars = createRing(20, 0.05,255,mirror,scene);

    return scene;
};

function debugEqualize(a) {
    a.DEBUGCANVASSIZE.width = 160;
    a.DEBUGCANVASSIZE.height = 100;
    a.DEBUGCANVASPOS.x = 0;
    a.DEBUGCANVASPOS.y = 0;
    a.drawDebugCanvas();
}

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
// Add your code here matching the playground format

const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene

engine.runRenderLoop(function () {
        scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});

function createRing(radius, size, nb, mirror, s) {
    const analyser = new BABYLON.Analyser(s);
    BABYLON.Engine.audioEngine.connectToAnalyser(analyser);
    analyser.FFT_SIZE = 512;
    analyser.SMOOTHING = 0.5;
    const strength = 1;

    const ring = Math.PI * 2;
    const angle = ring / nb;
    let color;
    let bars = [];
    for (var index = 0; index < analyser.FFT_SIZE / 2; index++) {
        const bar = BABYLON.Mesh.CreateBox("b" + index, size, s);
        bar.scaling.x = 8.0;
        
        //bar.lookAt(new BABYLON.Vector3(0, 0, 0));
        bar.material = new BABYLON.StandardMaterial("bm" + index, s);
        bar.position = new BABYLON.Vector3(index * 2, 0, 0);
        color = hsvToRgb(index / (analyser.FFT_SIZE) / 2 * 360, 120, 100),
        bar.material.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);
        //create ring
        bar.position.x = radius * Math.sin(angle * index);
        bar.position.y = 0.2;
        bar.position.z = radius * Math.cos(angle * index);
        bar.lookAt(new BABYLON.Vector3(0, bar.position.y, 0));

        bars.push(bar);
        mirror.material.reflectionTexture.renderList = bars;
    }
    // scale bars on the music
    s.registerBeforeRender(function () {
        const activeFrequencys = analyser.getByteFrequencyData();
	
	    for (var i = 0; i < analyser.getFrequencyBinCount() ; i++) {
	        bars[i].scaling.y =  activeFrequencys[i] * strength;
	    }
	});
    debugEqualize(analyser);
    return bars;
}

function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;

    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    s /= 100;
    v /= 100;

    if(s == 0) {
            r = g = b = v;
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }

    h /= 15; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        default: // case 5:
            r = v;
            g = p;
            b = q;
    }
    return {r: r, g: g, b: b};
}