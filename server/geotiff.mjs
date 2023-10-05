import geoblaze from "geoblaze";
import fetch from "node-fetch";

const TIF_URL =
  "https://treeline-tiff.sfo2.cdn.digitaloceanspaces.com/dsm-COG.tif";

// https://github.com/acao/geoblaze-gsoc/blob/main/src/app/page.tsx#L82

export async function loadTiff(res) {
  // const georaster = await geoblaze.parse(TIF_URL);
  console.log("we will fetch!");
  const response = await fetch(TIF_URL);
  console.log("we got a response!", TIF_URL);
  const arrayBuffer = await response.arrayBuffer();
  console.log("we got an array!");
  const georaster = await geoblaze.parse(arrayBuffer);
  console.log("we got a georaster!");
  const mean = await geoblaze.mean(georaster);
  console.log(mean);
  // res.send({ mean });
}
