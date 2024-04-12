import ThreeGlobe from "three-globe";
import countries from "../assets/globe-min.json";
import arcsData from "../assets/arcs-data.json";
import { hexToRgb, genRandomNumbers } from "../systems/utils";
import { Color } from "three";
import { Raycaster, Vector2 } from 'three';
import { PerspectiveCamera } from 'three';


const ARC_REL_LEN = 0.9; // relative to whole arc
const FLIGHT_TIME = 2000;
const NUM_RINGS = 1;
const RINGS_MAX_R = 3; // deg
const RING_PROPAGATION_SPEED = 3; // deg/sec

const interval = 2;
let deltaGlobe = 0;
let numbersOfRings = 0;

class Globe {
  constructor() {
    this.instance = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    });
    this.pointsData = [];

    this._buildData();
    this._buildMaterial();

    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5; // Adjust as needed
    this.camera.lookAt(this.instance.position);

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

    this.instance.tick = (delta) => this.tick(delta);
    window.addEventListener('click', (event) => this._onMouseClick(event), false);

  }

  async init() {
    await this._buildData();
    this.initCountries(1000);
    this.initAnimationData(1000);
  }

  _onMouseClick(event) {
    event.preventDefault();
    this.raycaster.setFromCamera(this.mouse, this.camera);

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.instance.children);

    if (intersects.length > 0) {
      const pointData = intersects[0].object.userData;
      this._onPointClick(pointData);
    }
  }

  initCountries(delay) {
    setTimeout(() => {
      this.instance
        .hexPolygonsData(countries.features)
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(true)
        .atmosphereColor("#ffffff")
        .atmosphereAltitude(0.1)
        .hexPolygonColor((e) => {
          return "rgba(255,255,255, 0.7)";
        });
    }, delay);
  }

  initAnimationData(delay) {
    setTimeout(() => {
      this.instance
        .arcsData(arcsData.flights)
        .arcStartLat((d) => d.startLat * 1)
        .arcStartLng((d) => d.startLng * 1)
        .arcEndLat((d) => d.endLat * 1)
        .arcEndLng((d) => d.endLng * 1)
        .arcColor((e) => e.color)
        .arcAltitude((e) => {
          return e.arcAlt * 1;
        })
        .arcStroke((e) => {
          return [0.32, 0.28, 0.3][Math.round(Math.random() * 2)];
        })
        .arcDashLength(ARC_REL_LEN)
        .arcDashInitialGap((e) => e.order * 1)
        .arcDashGap(15)
        .arcDashAnimateTime((e) => FLIGHT_TIME)
        .pointsData(this.pointsData)
        .pointColor((e) => e.color)
        .pointsMerge(true)
        .pointAltitude(0.0)
        .pointRadius(0.25)
        .ringsData([])
        .ringColor((e) => (t) => e.color(t))
        .ringMaxRadius(RINGS_MAX_R)
        .ringPropagationSpeed(RING_PROPAGATION_SPEED)
        .ringRepeatPeriod((FLIGHT_TIME * ARC_REL_LEN) / NUM_RINGS);
    }, delay);
  }

  tick(delta) {
    deltaGlobe += delta;

    if (deltaGlobe > interval) {
      numbersOfRings = genRandomNumbers(
        0,
        this.pointsData.length,
        Math.floor((this.pointsData.length * 4) / 5)
      );
      this.instance.ringsData(
        this.pointsData.filter((d, i) => numbersOfRings.includes(i))
      );

      deltaGlobe = deltaGlobe % interval;
    }
  }

  async _buildData() {
    let points = [];
    try {
      // Fetch data from API
      const response = await fetch('https://api.reliefweb.int/v1/disasters?appname=rw-user-0&profile=full&preset=latest&slim=0&limit=1');
      const data = await response.json();
      const arcs = data.data; // get the 'data' array from the response

      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        const rgb = hexToRgb('#62DAFF'); // use a fixed color for now
        points.push({
          size: 1.0,
          order: i, // use the index as the order
          color: (t) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`,
          label: arc.fields.primary_country.name,
          lat: arc.fields.primary_country.location.lat,
          lng: arc.fields.primary_country.location.lon,
        });
      }
      this.pointsData = points.filter(
        (v, i, a) =>
          a.findIndex((v2) => ["lat", "lng"].every((k) => v2[k] === v[k])) === i
      );
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  _buildMaterial() {
    const globeMaterial = this.instance.globeMaterial();
    globeMaterial.color = new Color(0x3b42ec);
    globeMaterial.emissive = new Color(0x220038);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0.9;
  }
}

export { Globe };
