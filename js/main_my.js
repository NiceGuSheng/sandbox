console.log("hello");
var scene;
var camera;
var renderer;
var effectController;

var data;
var width;
var height;
var size ;
var depthTexture;
var textureLoader;

var customUniforms;
var effectController;
var plane;
var f0,f1,fa,fb;
var fv = 0;

var fva=0;
var fvb=0;

var customUniforms;
//地面
var plane;

//方块的参数
var fly;
var flybody;
var cube;
var cubego=1;
var cuberote=5;
var cubeselfrote=5;
var cubeup=5;

init();
animate();


// FUNCTIONS
function init()
{

	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = 1280, SCREEN_HEIGHT = 720;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;

	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);


	// RENDERER
       if ( Detector.webgl )//判断浏览器是否支持
		renderer = new THREE.WebGLRenderer( {antialias:true} );//打开抗锯齿
	else
		renderer = new THREE.CanvasRenderer();

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);//渲染器大小
    renderer.shadowMapEnabled = true;//开启阴影，加上阴影渲染

	container = document.getElementById( 'ThreeJS' );//将渲染结果绑定
	container.appendChild( renderer.domElement );


    // LIGHT
    light = new THREE.PointLight(0xfff000);
    light.position.set( 200, 200, 200 );
    light.castShadow = true;//开启灯光投射阴影
    scene.add(light);

    var cubeGeo = new THREE.CubeGeometry(2,2,2,1,1,1);
    var cubeMesh = new THREE.Mesh(cubeGeo,new THREE.MeshBasicMaterial({color:0x00ffff}));
    //light.add(cubeMesh);
	controls = new THREE.OrbitControls( camera, renderer.domElement );//旋转视角
	controls.enable();


	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enable();
	
	//创建可交互界面的参数 用于参数的实时输入
    effectController  = {
        focusLen: 50,
        posx:0,
        posz:0,
        posy:480,
        bumpScale:90,
        lockCamera: false,
        showWater: true,
        waterY:-90
    };
    camera.position.set(0,effectController.posy,0);
    camera.lookAt(scene.position);
	
	//地形高度的贴图
	width = 512;
    height = 424;
    size = width * height;
	//js类型化数组
    data = new Uint8Array( 3 * size );
    depthTexture = new THREE.DataTexture( data, width, height, THREE.RGBFormat );
    //凹凸贴图是实时变化的 需要实时更新
	depthTexture.needsUpdate = true;
	var bumpScale   = effectController.bumpScale;
	
	//加载外部的贴图文件
	textureLoader = new THREE.TextureLoader();
    var creatureImage = textureLoader.load('images/depth.png');
    var oceanTexture = textureLoader.load('images/dirt-512.jpg');
    var sandyTexture = textureLoader.load('images/sand-512.jpg');
    var grassTexture = textureLoader.load('images/grass-512.jpg');
    var rockyTexture = textureLoader.load('images/rock-512.jpg');
    var snowyTexture = textureLoader.load('images/snow-512.jpg');
	
	//创建和shader程序里 相对应的 用 uniform 存取限定词修饰变量
    customUniforms = 
            {
                bumpTexture: {type: 't', value: creatureImage},
                bumpScale:	    { type: "f", value: bumpScale},
                oceanTexture:	{ type: "t", value: oceanTexture },
                sandyTexture:	{ type: "t", value: sandyTexture },
                grassTexture:	{ type: "t", value: grassTexture },
                rockyTexture:	{ type: "t", value: rockyTexture },
                snowyTexture:	{ type: "t", value: snowyTexture },
            };
       
	
	// create custom material from the shader code above
	//   that is within specially labelled script tags
	var customMaterial = new THREE.ShaderMaterial(
	{
	    uniforms: customUniforms,
		vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
       
	}   );
    customMaterial.uniforms.bumpTexture.value = creatureImage;
    customMaterial.uniforms.oceanTexture.value = oceanTexture;
    customMaterial.uniforms.sandyTexture.value = sandyTexture;
    customMaterial.uniforms.grassTexture.value = grassTexture;
    customMaterial.uniforms.rockyTexture.value = rockyTexture;
    customMaterial.uniforms.snowyTexture.value = snowyTexture;
	
	//创建地面

	var planeGeo = new THREE.PlaneBufferGeometry( 512, 424, 256, 212 );
	plane = new THREE.Mesh(	planeGeo, customMaterial );
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -100;
	scene.add( plane );

   //创建水
    var waterGeo = new THREE.PlaneGeometry( 1000, 1000, 1, 1 );
    var waterTex = new THREE.ImageUtils.loadTexture( 'images/water512.jpg' );
    waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(5,5);
    var waterMat = new THREE.MeshBasicMaterial( {map: waterTex, transparent:true, opacity:0.40} );

    var water = new THREE.Mesh( planeGeo, waterMat );
    water.rotation.x = -Math.PI / 2;
    water.position.y = effectController.waterY;
    water.castShadow = true;//开启投影
    water.receiveShadow = true;//接收阴影
    scene.add( water);

    //创建方块
	//方块一
    var cubeG=new THREE.CubeGeometry(20,5,20);
    var cubeT=new THREE.MeshLambertMaterial({color:0x00ffff});
    //var cubeMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff});
    cube=new THREE.Mesh(cubeG,cubeT);
    //方块二
    var cubeG1=new THREE.CubeGeometry(25,5,5);
    var cubeT1=new THREE.MeshLambertMaterial({color:0x0000FF00});
    cube1=new THREE.Mesh(cubeG1,cubeT1);
    cube1.position.y+=10;
    cube1.position.x+=7;
    cube.castShadow = true;
    cube.add(cube1);
    //添加到场景中
    scene.add(cube);


	//创建可交互的界面
	//GUI
    var gui = new dat.GUI();
    gui.add( effectController, 'focusLen', 14, 72, 0.1 ).onChange(function(){
        camera.setFocalLength(effectController.focusLen);
    } );
    gui.add( effectController, 'posx', -100, 100, 0.1 ).onChange( function(){
        camera.position.setX(effectController.posx);
    }  );
    gui.add( effectController, 'posz', -100, 100, 0.1 ).onChange( function(){
        camera.position.setZ(effectController.posz);
    } );
    gui.add( effectController, 'posy', 0, 720, 0.1 ).onChange(function(){
        camera.position.setY(effectController.posy);
    }  );
    gui.add( effectController, 'bumpScale', 50.0, 256.0, 0.1 ).onChange( function(){
        customUniforms.bumpScale.value=effectController.bumpScale;
    } );
    
} 

function animate()
{
	requestAnimationFrame( animate );
	//这一行代码是关键 必须每次像调用函数一样反复执行才能更新
    depthTexture.needsUpdate=true;
    render();
	update();
}

var i=0;
var wrap=160;
function update()
{
    cube.position.x+= fv*Math.cos(cube.rotation.y);
    cube.position.z-=fv*Math.sin(cube.rotation.y);

    cube.position.y+=fv*Math.sin(cube.rotation.z);

    if(effectController.lockCamera==false){
    controls.update();
}

    var timestampNow = new Date().getTime()/1000.0;
    var lightIntensity = 0.75 +
        0.25 * Math.cos(timestampNow *
            Math.PI);
}

function render()
{
	renderer.render( scene, camera );

}

document.onkeydown=function(ev){
    updateHUD();
    if(ev.keyCode==38)
    {
        fv=1;
    }
    else if(ev.keyCode==40)
    {
        fv=-1;
    }
    //旋转方向
    if(ev.keyCode==37)
    {
        cube.rotation.y+=0.1;
    }
    if(ev.keyCode==39)
    {
        cube.rotation.y-=0.1;
    }
    if(ev.keyCode==87)
    {
        if(cube.rotation.z>0.6)
            return;
        cube.rotation.z+=0.1;

    }
    if(ev.keyCode==83)
    {
        if(cube.rotation.z<-0.6)
            return;
        cube.rotation.z-=0.1;
    }
    if(ev.keyCode==65)
    {
        if(cube.rotation.x<-1)
            return;
        cube.rotation.x-=0.1;
    }
    if(ev.keyCode==68)
    {
        if(cube.rotation.x>1)
            return;
        cube.rotation.x+=0.1;
    }

}
document.onkeyup=function(ev){
    cubego=0;
    fv=0;
}
var hud = document.getElementById("webgl");
var ctx = hud.getContext("2d");
updateHUD();
function updateHUD()
{
    // 绘制白色的文本
        ctx.clearRect(0, 0, 400, 400); // 清除 <hud>
        ctx.font = '18px "Times New Roman"';

        ctx.fillStyle = 'rgba(70, 80, 180, 1)'; // 设置文本颜色

        ctx.fillText('Use W S A D control cube`s Rotation',0,30);

        ctx.fillText('坦克坐标:', 40, 60);

        ctx.fillText('x='+cube.position.x, 40, 80);

        ctx.fillText('y='+cube.position.y, 40, 100);

        ctx.fillText('z='+cube.position.z, 40, 120);

        ctx.fillText('旋转角度:', 40, 140);

        ctx.fillText('x='+cube.rotation.x, 40, 160);
        
        ctx.fillText('y='+cube.rotation.y, 40, 180);

        ctx.fillText('z='+cube.rotation.z, 40, 200);
        
        console.log(cube.rotation.x);

}	