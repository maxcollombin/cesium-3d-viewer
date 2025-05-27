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
        baseLayerPicker: true,
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

      // Add the TopBoundary 3D Tileset
      const tileset = new Cesium.Cesium3DTileset({
        url: "./src/models/TopBoundary/tileset.json"
      });

      tileset.readyPromise
        .then(() => {
          console.log("✅ TopBoundary tileset chargé");
          viewer.scene.primitives.add(tileset);

        // Tileset styling
        tileset.style = new Cesium.Cesium3DTileStyle({
          color: "color('#87ceeb', 0.8)",
          show: "true",
        });
        })
        .catch((error) => {
          console.error("❌ Erreur lors du chargement du TopBoundary tileset :", error);
        });

        // Bâtiments 3D
        const buildingsTileset = viewer.scene.primitives.add(
          new Cesium.Cesium3DTileset({
            url: "https://3d.geo.admin.ch/ch.swisstopo.swissbuildings3d.3d/v1/tileset.json"
          })
        );
        // Wait for the buildings tileset to be ready
        buildingsTileset.readyPromise
          .then(() => {
            console.log("🏙️ Bâtiments 3D chargés");
            // Clamping des bâtiments au terrain
            buildingsTileset.root.transform = Cesium.Matrix4.IDENTITY;
          })
          .catch((error) => {
            console.error("❌ Erreur chargement bâtiments :", error);

          });
        // Végétation 3D
        const vegetationTileset = viewer.scene.primitives.add(
          new Cesium.Cesium3DTileset({
            url: "https://3d.geo.admin.ch/ch.swisstopo.vegetation.3d/v1/tileset.json"
          })
        );
        vegetationTileset.readyPromise
          .then(() => {
            console.log("🌲 Végétation 3D chargée");
            // Clamping de la végétation au terrain
            vegetationTileset.root.transform = Cesium.Matrix4.IDENTITY;
          })
          .catch((error) => {
            console.error("❌ Erreur chargement végétation :", error);
          });

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