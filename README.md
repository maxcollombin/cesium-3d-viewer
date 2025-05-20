# Cesium 3D Viewer Boilerplate

A simple boilerplate to quickly set up a Cesium 3D Viewer application.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (optional, for advanced development workflows)
- Python 3 (for serving the application locally)
- A valid [Cesium Ion](https://cesium.com/ion/) account to generate an access token

---

## Setup

### 1. Configure Cesium Ion Token

Create a file named `js/config.json` in the `js` directory and add your Cesium Ion access token:

```json
{
    "CESIUM_ION_ACCESS_TOKEN": "YOUR_TOKEN"
}
```

Replace `YOUR_TOKEN` with your valid Cesium Ion access token. This token is required to access Cesium's terrain and imagery services.

---

### 2. Add 3D Models

To include custom 3D models in your application:
1. Place your `.gltf` or `.glb` files in the `./models` directory.
2. Update the `js/app.js` file to load your models. For example:

```javascript
const model = viewer.entities.add({
  name: "My 3D Model",
  position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
  model: {
    uri: "./models/your-model.gltf",
    scale: 1.0
  }
});
viewer.flyTo(model);
```

Replace `longitude`, `latitude`, `height`, and `your-model.gltf` with your specific values.

---

### 3. Serve the Application Locally

Run the following command in the root directory of the project to start a local server:

```bash
python3 -m http.server 8000
```

This will serve the application on port `8000`.

---

### 4. Access the Application

Open your browser and navigate to:

```
http://localhost:8000
```

---

## Features

- **Custom Terrain**: The application uses Cesium Ion's terrain services by default.
- **Custom Imagery**: Easily integrate custom imagery layers using `Cesium.UrlTemplateImageryProvider`.
- **3D Models**: Add and display `.gltf` or `.glb` models in the viewer.
- **Camera Controls**: Real-time camera settings display (latitude, longitude, height, heading, pitch, roll).

---

## Troubleshooting

### Common Issues

1. **Cesium Ion Token Error**:
   - Ensure your `js/config.json` file contains a valid Cesium Ion token.
   - If you encounter a `401 Unauthorized` error, regenerate your token from the [Cesium Ion dashboard](https://cesium.com/ion/).

2. **Local Server Not Starting**:
   - If you see an error like `OSError: [Errno 98] Address already in use`, another process is using port `8000`. Use a different port:
     ```bash
     python3 -m http.server 8080
     ```
     Then access the application at `http://localhost:8080`.

3. **3D Models Not Loading**:
   - Verify the file path to your `.gltf` or `.glb` model in `js/app.js`.
   - Ensure the model is placed in the `./models` directory.

---

## Contributing

Feel free to fork this repository and submit pull requests for improvements or new features.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.