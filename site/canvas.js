'use strict'; //import { useRef, useEffect } from 'react';

import React, { useRef, useEffect } from 'https://cdn.skypack.dev/react';
import ReactDOM from 'https://cdn.skypack.dev/react-dom';

function fillWhite(canvas, imageData) {
  // Fill the ImageData with random static noise
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 0] = 255;
    imageData.data[i + 1] = 255;
    imageData.data[i + 2] = 255;
    imageData.data[i + 3] = 255; // Alpha (fully opaque)
  }
}

function fillRandom(canvas, imageData) {
  // Fill the ImageData with random static noise
  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = Math.random() * 255;
    imageData.data[i] = gray;
    imageData.data[i + 1] = gray;
    imageData.data[i + 2] = gray;
    imageData.data[i + 3] = 255; // Alpha (fully opaque)
  }
}

function blend(imageData, ii, zPct) {
  if (ii + 3 > imageData.data.length) {
    return;
  }

  const z = 255 * zPct;
  imageData.data[ii] = z * 0.5 + imageData.data[ii] * 0.5;
  imageData.data[ii + 1] = z * 0.5 + imageData.data[ii + 1] * 0.5;
  imageData.data[ii + 2] = z * 0.5 + imageData.data[ii + 2] * 0.5;
  imageData.data[ii + 3] = 255 * 0.5 + imageData.data[ii + 3] * 0.5;
}

function sineWave(canvas, imageData) {
  const verticalRepeats = 18;
  const amplitude = Math.floor(canvas.height / verticalRepeats); // per line
  // frequency is the number of x units

  const horizontalRepeats = 10;
  const frequency = 0.01; //10 / canvas.width;

  const lines = Math.ceil(canvas.height / amplitude);

  for (let i = 0; i < imageData.data.length; i += 4) {//const gray = i / imageData.data.length * 255;
    //blend(imageData, i, i / imageData.data.length);
    //imageData.data[i] = gray * 0.5 + imageData.data[i] * 0.5;
    //imageData.data[i + 1] = gray * 0.5 + imageData.data[i+1] * 0.5;
    //imageData.data[i + 2] = gray*0.5 + imageData.data[i+2]*0.5;
    //imageData.data[i + 3] = 255 * 0.5 * imageData.data[i+3]*0.5;     // Alpha (fully opaque)
  }

  for (let x = 0; x < canvas.width * lines; ++x) {
    //const zVal = Math.sin(frequency * x);
    const realX = Math.floor(x % canvas.width);
    const line = Math.floor(x / canvas.width);

    for (let y = 0; y < amplitude; ++y) {
      const realY = y + amplitude * line;
      const z = y / amplitude;
      const ii = (realY * canvas.width + realX) * 4;
      blend(imageData, ii, z); //const z = Math.random() * 255;//Math.round(zVal) === y ? 255 : 0;
      //imageData.data[(realX + realY * canvas.width) * 4 + 0] = z;
      //imageData.data[(realX + realY * canvas.width) * 4 + 1] = z;
      //imageData.data[(realX + realY * canvas.width) * 4 + 2] = z;
      //imageData.data[(realX + realY * canvas.width) * 4 + 3] = 255;
    }
  }
}

function CanvasChart({
  width,
  height
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    fillWhite(canvas, imageData);
    fillRandom(canvas, imageData);
    sineWave(canvas, imageData);
    ctx.putImageData(imageData, 0, 0); // Define the sine function parameters

    /*const amplitude = 100; // Height of the wave
    const frequency = 0.01; // How many waves per unit of x
    */

    /*
    // Draw the sine wave
    ctx.beginPath();
    ctx.moveTo(0, height / 2); // Start from the middle left of the canvas
     for (let x = 0; x < width; x++) {
      const y = height / 2 + amplitude * Math.sin(frequency * x);
      ctx.lineTo(x, y);
    }
     ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    */
  }, [width, height]);
  return /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    width: width,
    height: height
  });
}

function AppRoot() {
  return /*#__PURE__*/React.createElement("div", {
    id: "app"
  }, /*#__PURE__*/React.createElement("h1", null, "Canvas"), /*#__PURE__*/React.createElement(CanvasChart, {
    width: 600,
    height: 600
  }));
} //const domContainer = document.querySelector('#root');
//const root = ReactDOM.createRoot(domContainer);
//root.render(<AppRoot/>);


ReactDOM.render( /*#__PURE__*/React.createElement(AppRoot, null), document.getElementById('root'));