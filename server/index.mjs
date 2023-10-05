import express from "express";
import GeoTIFF, { fromFile } from "geotiff";
import bresenham from "bresenham";
import fs from "fs";

import { loadTiff } from "./geotiff.mjs";

const app = express();

// const cors = require("cors")

// app.use(cors)
app.use(express.json());

app.get("/load-tiff", (req, res) => {
  loadTiff(res);
});

app.get("/get-trees", (req, res) => {
  (async function () {
    const towerJSON = fs.readFileSync("./server/towers.json");
    const towers = JSON.parse(towerJSON);

    const tiff = await fromFile("./server/sample84.tif");
    const image = await tiff.getImage();

    const data = await image.readRasters();
    const { width, height } = data;

    const trees = getTreeIndices(data);
    const towersInTIF = [];

    towers.forEach((t) => {
      const pixel = getPixelFromLatLng(image, t.lat, t.lng);
      if (
        pixel.x >= 0 &&
        pixel.x <= width &&
        pixel.y >= 0 &&
        pixel.y <= height
      ) {
        const tower = { ...t, ...pixel };
        towersInTIF.push(tower);
      }
    });

    const treesWithTowers = [];

    for (let i = 0; i < trees.length; i++) {
      const towersInSight = findClearLineOfSight({
        testTree: trees[i],
        image,
        data,
        towersInTIF,
      });

      const pixel = { x: x(trees[i], width), y: y(trees[i], width) };
      const { lat, lng } = getLatLngfromPixel(image, pixel.y, pixel.x);

      treesWithTowers.push({
        lat,
        lon: lng,
        aps: towersInSight,
      });
    }

    res.send(treesWithTowers.filter((t) => t.aps.length));
  })();
});

app.listen(4000, () => {
  console.log("Server is running");
});

function transformFromMatrix(a, b, M, roundToInt = false) {
  const round = (v) => (roundToInt ? v | 0 : v);
  return [round(M[0] + M[1] * a + M[2] * b), round(M[3] + M[4] * a + M[5] * b)];
}

const x = (i, width) => i % width;
const y = (i, width) => Math.floor(i / width);

const getPixelFromLatLng = (image, lat, lng) => {
  const { ModelPixelScale: s, ModelTiepoint: t } = image.fileDirectory;
  let [sx, sy, sz] = s;
  let [px, py, k, gx, gy, gz] = t;
  sy = -sy;

  const gpsToPixel = [-gx / sx, 1 / sx, 0, -gy / sy, 0, 1 / sy];
  const [x, y] = transformFromMatrix(lng, lat, gpsToPixel, true);

  return { x, y };
};

const getLatLngfromPixel = (image, x, y) => {
  const { ModelPixelScale: s, ModelTiepoint: t } = image.fileDirectory;
  let [sx, sy, sz] = s;
  let [px, py, k, gx, gy, gz] = t;
  sy = -sy;

  const pixelToGPS = [gx, sx, 0, gy, 0, sy];
  const [lng, lat] = transformFromMatrix(y, x, pixelToGPS, false);

  return { lat, lng };
};

const getTreeIndices = (data) => {
  const { width, height } = data;
  const pixels = data[0];

  const offset = 2;
  const clearance = 1;
  const trees = [];

  for (let x = offset; x < width - offset; x++) {
    for (let y = offset; y < height - offset; y++) {
      // get our pixel's index;
      const i = y * width + x;
      // surrounding = [[x, y-s], [x-s, y], [x+s, y], [x, y+s]]
      const surrounding = [
        (y - offset) * width + x,
        y * width + (x - offset),
        y * width + (x + offset),
        (y + offset) * width + x,
      ];
      const heightToTest = pixels[i] - clearance;
      if (surrounding.every((s) => heightToTest > pixels[s])) trees.push(i);
    }
  }
  return trees;
};

const findClearLineOfSight = ({ testTree, image, data, towersInTIF }) => {
  const { width } = data;
  const pixels = data[0];

  const testCoords = [x(testTree, width), y(testTree, width)];
  const z1 = pixels[testTree];

  const visibleTowers = [];

  for (let i = 0; i < towersInTIF.length; i++) {
    const towerPixel = getPixelFromLatLng(
      image,
      towersInTIF[i].lat,
      towersInTIF[i].lng
    );
    const towerIndex = towerPixel.y * width + towerPixel.x;
    // x, y, get index for height

    const z2 = pixels[towerIndex];
    const towerCoords = [towerPixel.x, towerPixel.y];

    let axis = 0;
    if (
      Math.abs(towerCoords[1] - testCoords[1]) >
      Math.abs(towerCoords[0] - testCoords[0])
    )
      axis = 1;

    const slope = (z2 - z1) / (towerCoords[axis] - testCoords[axis]);

    const line = bresenham(
      testCoords[0],
      testCoords[1],
      towerCoords[0],
      towerCoords[1]
    );
    let isVisible = true;

    const clearanceThreshold = 0.5;

    for (var j = 0; j < line.length; j++) {
      const point = line[j];
      const cartesian = [point.x, point.y];
      const zPixel = pixels[point.y * width + point.x];
      const zTreeline = slope * (cartesian[axis] - testCoords[axis]) + z1;
      if (zPixel > zTreeline + clearanceThreshold) {
        isVisible = false;
        break;
      }
    }

    if (isVisible) {
      visibleTowers.push(towersInTIF[i]);
    }
    // console.log("clear line of sight for", testCoords, towerCoords);
  }
  return visibleTowers;
};
