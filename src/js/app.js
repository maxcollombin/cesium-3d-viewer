document.addEventListener('DOMContentLoaded', function () {
  console.log("📄 DOM chargé, chargement de config.json...");

  // Utilisation d'une fonction asynchrone séparée
  (async function initializeCesium() {
    try {
      // Charge le fichier config.json
      const response = await fetch("./src/js/config.json");
      if (!response.ok) {
        throw new Error(`Erreur lors du chargement de config.json : ${response.statusText}`);
      }
      const config = await response.json();
      console.log("✅ config.json chargé :", config);

      // Applique le token à Cesium
      Cesium.Ion.defaultAccessToken = config.CESIUM_ION_ACCESS_TOKEN;

      console.log("🌍 Initialisation du terrain avec swisstopo...");
      const terrain = new Cesium.CesiumTerrainProvider({
        url: "https://3d.geo.admin.ch/ch.swisstopo.terrain.3d/v1"
      });

      // Ajout du fond de carte personnalisé
      const imageryProvider = new Cesium.UrlTemplateImageryProvider({
        url: "https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.swisstlm3d-karte-farbe.3d/default/current/4326/{z}/{x}/{y}.jpeg",
        credit: "© swisstopo",
        tilingScheme: new Cesium.GeographicTilingScheme(),
        maximumLevel: 18
      });

      // Initialisation du viewer Cesium
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

      // Activer le terrain pour le clamping
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // Charger le modèle NouveauxBatiments.glb
      const modelUrl = "./src/models/NouveauxBatiments.glb";
      const modelPosition = Cesium.Cartesian3.fromDegrees(7.3476689118966965, 46.22494365977509, 0);

      // Créer la matrice de transformation de base
      let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(modelPosition);

      // Appliquer une rotation de 45 degrés autour de l'axe Z pour orienter vers le nord-est
      const rotationMatrix = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(-90)); // Rotation de 90
      modelMatrix = Cesium.Matrix4.multiplyByMatrix3(modelMatrix, rotationMatrix, new Cesium.Matrix4());

      Cesium.Model.fromGltfAsync({
        url: modelUrl,
        modelMatrix: modelMatrix,
        scale: 1.0 // Ajustez l'échelle si nécessaire
      }).then((model) => {
        viewer.scene.primitives.add(model);
        console.log("✅ Modèle NouveauxBatiments.glb chargé");

        // Modification de la couleur et de la transparence du modèle
        model.color = Cesium.Color.fromCssColorString("#008000").withAlpha(0.5);

      }).catch((error) => {
        console.error("❌ Erreur lors du chargement du modèle NouveauxBatiments.glb :", error);
      });

      // Enregistre les événements de la caméra
      viewer.camera.changed.addEventListener(() => {
        const cartographic = Cesium.Cartographic.fromCartesian(viewer.camera.position);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
        const height = cartographic.height.toFixed(2);

        const heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(2);
        const pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(2);
        const roll = Cesium.Math.toDegrees(viewer.camera.roll).toFixed(2);

        // Enregistre les paramètres de la caméra dans la console
        console.log(`Camera Settings:
          Latitude: ${latitude}°
          Longitude: ${longitude}°
          Height: ${height}m
          Heading: ${heading}°
          Pitch: ${pitch}°
          Roll: ${roll}°`);

        // Affiche les paramètres de la caméra dans le conteneur HTML
        document.getElementById("latitude").textContent = latitude;
        document.getElementById("longitude").textContent = longitude;
        document.getElementById("height").textContent = height;
        document.getElementById("heading").textContent = heading;
        document.getElementById("pitch").textContent = pitch;
        document.getElementById("roll").textContent = roll;
      });

      // Bâtiments 3D
      const buildingsTileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: "https://3d.geo.admin.ch/ch.swisstopo.swissbuildings3d.3d/v1/tileset.json"
        })
      );

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

      // Paramètres de la caméra
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(7.331314, 46.219879, 812.59),
        orientation: {
          heading: Cesium.Math.toRadians(77.84),
          pitch: Cesium.Math.toRadians(-10.22),
          roll: Cesium.Math.toRadians(360.00)
        }
      });

    } catch (error) {
      console.error("❌ Erreur d'initialisation :", error);
    }
  })();
});