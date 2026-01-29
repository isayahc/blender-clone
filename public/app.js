import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

class BlenderClone {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.transformControls = null;
        this.objects = new Map();
        this.selectedObject = null;
        this.objectCounter = 0;
        
        this.init();
        this.setupLights();
        this.setupGrid();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene.background = new THREE.Color(0x383838);

        // Camera setup
        const canvas = document.getElementById('canvas');
        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(7, 5, 7);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Transform controls
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.controls.enabled = !event.value;
        });
        this.transformControls.addEventListener('change', () => {
            this.updatePropertiesPanel();
        });
        this.scene.add(this.transformControls);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    setupGrid() {
        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x2a2a2a);
        this.scene.add(gridHelper);

        // Axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    setupEventListeners() {
        // Add object buttons
        document.getElementById('add-cube').addEventListener('click', () => this.addCube());
        document.getElementById('add-sphere').addEventListener('click', () => this.addSphere());
        document.getElementById('add-cylinder').addEventListener('click', () => this.addCylinder());
        document.getElementById('add-plane').addEventListener('click', () => this.addPlane());
        document.getElementById('add-torus').addEventListener('click', () => this.addTorus());
        document.getElementById('add-cone').addEventListener('click', () => this.addCone());

        // Edit buttons
        document.getElementById('delete-object').addEventListener('click', () => this.deleteSelected());
        document.getElementById('duplicate-object').addEventListener('click', () => this.duplicateSelected());

        // Transform mode buttons
        document.getElementById('mode-select').addEventListener('click', () => this.setTransformMode('select'));
        document.getElementById('mode-translate').addEventListener('click', () => this.setTransformMode('translate'));
        document.getElementById('mode-rotate').addEventListener('click', () => this.setTransformMode('rotate'));
        document.getElementById('mode-scale').addEventListener('click', () => this.setTransformMode('scale'));

        // Object selection in viewport
        this.renderer.domElement.addEventListener('click', (event) => this.onCanvasClick(event));

        // Keyboard shortcuts
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
    }

    addObject(geometry, name) {
        const material = new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff,
            roughness: 0.5,
            metalness: 0.2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Position new objects slightly above the grid
        mesh.position.y = 1;

        const id = `${name}_${this.objectCounter++}`;
        mesh.userData.id = id;
        mesh.userData.name = name;

        this.scene.add(mesh);
        this.objects.set(id, mesh);
        this.addToOutliner(id, name);
        this.selectObject(mesh);
        
        this.updateStatus(`Added ${name}`);
    }

    addCube() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        this.addObject(geometry, 'Cube');
    }

    addSphere() {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        this.addObject(geometry, 'Sphere');
    }

    addCylinder() {
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        this.addObject(geometry, 'Cylinder');
    }

    addPlane() {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshStandardMaterial({ 
            color: Math.random() * 0xffffff,
            roughness: 0.5,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        mesh.position.y = 0.01;

        const id = `Plane_${this.objectCounter++}`;
        mesh.userData.id = id;
        mesh.userData.name = 'Plane';

        this.scene.add(mesh);
        this.objects.set(id, mesh);
        this.addToOutliner(id, 'Plane');
        this.selectObject(mesh);
        
        this.updateStatus('Added Plane');
    }

    addTorus() {
        const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
        this.addObject(geometry, 'Torus');
    }

    addCone() {
        const geometry = new THREE.ConeGeometry(0.5, 1, 32);
        this.addObject(geometry, 'Cone');
    }

    addToOutliner(id, name) {
        const outlinerList = document.getElementById('scene-objects');
        const li = document.createElement('li');
        li.textContent = `🔷 ${name}`;
        li.dataset.id = id;
        li.addEventListener('click', () => {
            const obj = this.objects.get(id);
            if (obj) this.selectObject(obj);
        });
        outlinerList.appendChild(li);
    }

    removeFromOutliner(id) {
        const outlinerList = document.getElementById('scene-objects');
        const li = outlinerList.querySelector(`[data-id="${id}"]`);
        if (li) li.remove();
    }

    selectObject(object) {
        // Deselect previous
        const outlinerItems = document.querySelectorAll('#scene-objects li');
        outlinerItems.forEach(item => item.classList.remove('selected'));

        // Select new
        this.selectedObject = object;
        if (object) {
            this.transformControls.attach(object);
            const li = document.querySelector(`#scene-objects li[data-id="${object.userData.id}"]`);
            if (li) li.classList.add('selected');
            this.updatePropertiesPanel();
            this.updateStatus(`Selected: ${object.userData.name}`);
        } else {
            this.transformControls.detach();
        }
    }

    updatePropertiesPanel() {
        const propertiesDiv = document.getElementById('object-properties');
        
        if (!this.selectedObject) {
            propertiesDiv.innerHTML = '<p style="color: #666; font-size: 12px;">Select an object to view properties</p>';
            return;
        }

        const obj = this.selectedObject;
        propertiesDiv.innerHTML = `
            <div class="property-group">
                <h4 style="margin-bottom: 10px;">${obj.userData.name}</h4>
            </div>
            <div class="property-group">
                <label>Position</label>
                <div class="property-row">
                    <input type="number" id="pos-x" value="${obj.position.x.toFixed(2)}" step="0.1">
                    <input type="number" id="pos-y" value="${obj.position.y.toFixed(2)}" step="0.1">
                    <input type="number" id="pos-z" value="${obj.position.z.toFixed(2)}" step="0.1">
                </div>
            </div>
            <div class="property-group">
                <label>Rotation (degrees)</label>
                <div class="property-row">
                    <input type="number" id="rot-x" value="${THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(0)}" step="15">
                    <input type="number" id="rot-y" value="${THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(0)}" step="15">
                    <input type="number" id="rot-z" value="${THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(0)}" step="15">
                </div>
            </div>
            <div class="property-group">
                <label>Scale</label>
                <div class="property-row">
                    <input type="number" id="scale-x" value="${obj.scale.x.toFixed(2)}" step="0.1" min="0.01">
                    <input type="number" id="scale-y" value="${obj.scale.y.toFixed(2)}" step="0.1" min="0.01">
                    <input type="number" id="scale-z" value="${obj.scale.z.toFixed(2)}" step="0.1" min="0.01">
                </div>
            </div>
        `;

        // Add event listeners for property inputs
        ['x', 'y', 'z'].forEach(axis => {
            const posInput = document.getElementById(`pos-${axis}`);
            const rotInput = document.getElementById(`rot-${axis}`);
            const scaleInput = document.getElementById(`scale-${axis}`);

            if (posInput) {
                posInput.addEventListener('input', (e) => {
                    obj.position[axis] = parseFloat(e.target.value);
                });
            }

            if (rotInput) {
                rotInput.addEventListener('input', (e) => {
                    obj.rotation[axis] = THREE.MathUtils.degToRad(parseFloat(e.target.value));
                });
            }

            if (scaleInput) {
                scaleInput.addEventListener('input', (e) => {
                    obj.scale[axis] = parseFloat(e.target.value);
                });
            }
        });
    }

    setTransformMode(mode) {
        // Update button states
        document.querySelectorAll('#transform-mode button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`mode-${mode}`).classList.add('active');

        // Set transform controls mode
        if (mode === 'select') {
            this.transformControls.detach();
            if (this.selectedObject) {
                this.transformControls.attach(this.selectedObject);
            }
            this.transformControls.setMode('translate');
        } else {
            this.transformControls.setMode(mode);
        }
    }

    deleteSelected() {
        if (!this.selectedObject) {
            this.updateStatus('No object selected');
            return;
        }

        const id = this.selectedObject.userData.id;
        this.scene.remove(this.selectedObject);
        this.objects.delete(id);
        this.removeFromOutliner(id);
        this.transformControls.detach();
        this.selectedObject = null;
        this.updatePropertiesPanel();
        this.updateStatus('Object deleted');
    }

    duplicateSelected() {
        if (!this.selectedObject) {
            this.updateStatus('No object selected');
            return;
        }

        const original = this.selectedObject;
        const clone = original.clone();
        clone.position.x += 1;

        const id = `${original.userData.name}_${this.objectCounter++}`;
        clone.userData.id = id;
        clone.userData.name = original.userData.name;

        this.scene.add(clone);
        this.objects.set(id, clone);
        this.addToOutliner(id, original.userData.name);
        this.selectObject(clone);
        
        this.updateStatus(`Duplicated ${original.userData.name}`);
    }

    onCanvasClick(event) {
        if (this.transformControls.dragging) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);

        const meshes = Array.from(this.objects.values());
        const intersects = raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
            this.selectObject(intersects[0].object);
        } else {
            this.selectObject(null);
        }
    }

    onKeyDown(event) {
        if (event.target.tagName === 'INPUT') return;

        switch(event.key.toLowerCase()) {
            case 'g':
                this.setTransformMode('translate');
                break;
            case 'r':
                this.setTransformMode('rotate');
                break;
            case 's':
                this.setTransformMode('scale');
                break;
            case 'x':
            case 'delete':
                this.deleteSelected();
                break;
            case 'escape':
                this.selectObject(null);
                break;
        }
    }

    updateStatus(message) {
        document.getElementById('status-text').textContent = message;
    }

    onWindowResize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application
new BlenderClone();
