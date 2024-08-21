import { useState } from 'react';
import { ILinkedVertex, polygon } from './polygon';

interface IState {
  polygons: { [polygonNo: number]: ILinkedVertex[] };
  drawingAnchor?: ILinkedVertex;
}

// const ACTIVE_IMG_NO = 0;

function App() {
  const [canvasState, setCanvasState] = useState<IState>({ polygons: {} });

  console.log('canvasState', canvasState);

  return (
    <>
      <canvas
        width={400}
        height={400}
        style={{ backgroundColor: 'white' }}
        onClick={(e) => {
          const coord = {
            x: polygon.getXCord(e),
            y: polygon.getYCord(e),
          };
          const { polygons, drawingAnchor } = canvasState;
          const currentPolygonNo =
            drawingAnchor?.polygonNo ?? getPolygonNo(Object.keys(polygons));

          let currentPolygonVertices = polygons?.[currentPolygonNo] ?? [];
          const vertexNo = polygon.createVertexNo(currentPolygonVertices);

          const { newAnchor, newVertices } = polygon.createVertex(
            currentPolygonVertices,
            1,
            coord,
            vertexNo,
            drawingAnchor
          );
          polygons[currentPolygonNo] = newVertices;

          setCanvasState({ polygons: polygons, drawingAnchor: newAnchor });
          polygon.draw(newVertices, e.currentTarget.getContext('2d'), 3, "red");
        }}
      ></canvas>
    </>
  );
}

function getPolygonNo(polygonIds: (string | number)[]) {
  const lastPolygonNo = Math.max(...polygonIds.map((id) => Number(id)));
  const newPolygonNo = Number.isFinite(lastPolygonNo) ? lastPolygonNo : 0;

  return newPolygonNo + 1;
}

// TODO: How to compute new polygon No?

export default App;
