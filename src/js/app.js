document.addEventListener('DOMContentLoaded', function () {
  console.log("📄 DOM chargé, chargement de config.json...");

  (async function initializeCesium() {
    try {
      // Load config.json
      const response = await fetch("./src/js/config.json");
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement de config.json : ${response.statusText}`);
      }
      const config = await response.json();
      console.log("✅ config.json chargé :", config);

      // Apply Cesium Ion token
      Cesium.Ion.defaultAccessToken = config.CESIUM_ION_ACCESS_TOKEN;

      console.log("🌍 Initialisation du terrain avec swisstopo...");
      const terrain = new Cesium.CesiumTerrainProvider({
        url: "https://3d.geo.admin.ch/ch.swisstopo.terrain.3d/v1"
      });

      const imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-karte-farbe.3d/default/current/4326/{z}/{x}/{y}.jpeg",
        credit: "© swisstopo",
        tilingScheme: new Cesium.GeographicTilingScheme(),
        maximumLevel: 18
      });

      const viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: terrain,
        imageryProvider: imageryProvider,
        baseLayerPicker: false,
        fullscreenButton: false,
        homeButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        animation: false,
        geocoder: true
      });

      console.log("✅ Viewer initialisé");

      // Enable depth testing against terrain
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // Function to load a model
      function loadModel(viewer, url, position, rotationAngle, color, scale) {
        const modelPosition = Cesium.Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude);
        let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelPosition);

        // Apply rotation
        const rotationMatrix = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotationAngle));
        modelMatrix = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotationMatrix, new Cesium.Matrix4());

        // Load the model
        Cesium.Model.fromGltfAsync({
          url: url,
          modelMatrix: modelMatrix,
          scale: scale
        }).then((model) => {
          viewer.scene.primitives.add(model);
          console.log(`✅ Modèle chargé : ${url}`);

          // Apply color and transparency
          if (color) {
            model.color = Cesium.Color.fromCssColorString(color).withAlpha(0.7);
          }
        }).catch((error) => {
          console.error(`❌ Erreur lors du chargement du modèle ${url} :`, error);
        });
      }

      // Add multiple models
      loadModel(viewer, "./src/models/NouveauxBatiments.glb", { longitude: 7.3476689118966965, latitude: 46.22494365977509, altitude: 0 }, -90, "#008000", 1.0);
      loadModel(viewer, "./src/models/Demolitions.glb", { longitude: 7.3476689118966965, latitude: 46.22494365977509, altitude: 0 }, -90, "#ff0000", 1.0);
      loadModel(viewer, "./src/models/BatimentsExistants.glb", { longitude: 7.3476689118966965, latitude: 46.22494365977509, altitude: 0 }, -90, "#ffff00", 1.0);
      loadModel(viewer, "./src/models/Ols.gltf", { longitude: 7.37761997091807, latitude: 46.230961504973, altitude: 53 }, -90, "#0000ff", 1.0);
      loadModel(viewer, "./src/models/PlafondAerien.gltf", { longitude: 7.34045639023838, latitude: 46.221368116825, altitude: 482.39999988 }, -90, "#ff00ff", 1.0);

      // Fly to initial camera position
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(7.331314, 46.219879, 812.59),
        orientation: {
          heading: Cesium.Math.toRadians(77.84),
          pitch: Cesium.Math.toRadians(-10.22),
          roll: Cesium.Math.toRadians(0)
        }
      });

    } catch (error) {
      console.error("❌ Erreur d'initialisation :", error);
    }
  })();
});