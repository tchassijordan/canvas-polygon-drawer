import { MouseEvent } from 'react';
import { first } from 'lodash';

export interface ILinkedVertex extends IVertex {
  vertexNo: number;
  polygonNo: number;
  leftSibling?: ILinkedVertex;
  rightSibling?: ILinkedVertex;
}

interface IVertex {
  x: number;
  y: number;
}

function createVertex(
  polygonId: number,
  coord: IVertex,
  vertexNo: number,
  anchor?: ILinkedVertex
): {
  vertex: ILinkedVertex;
  anchor?: ILinkedVertex;
} {
  const vertex = {
    ...coord,
    vertexNo,
    polygonNo: polygonId,
    leftSibling: anchor,
    rightSibling: undefined,
  };

  if (anchor) {
    const anchorClone = { ...anchor };
    anchorClone.rightSibling = vertex;

    return {
      vertex,
      anchor: anchorClone,
    };
  }

  return { vertex };
}

function createVertexV2(
  vertices: ILinkedVertex[],
  polygonId: number,
  coord: IVertex,
  vertexNo: number,
  oldAnchor?: ILinkedVertex
) {
  const oldAnchorClone = { ...oldAnchor };
  const newVertex = {
    ...coord,
    vertexNo,
    polygonNo: polygonId,
    leftSibling: oldAnchor,
    rightSibling: undefined,
  };

  const pointOfIntersection = getVertexAtIntersection(vertices, coord);

  if (!pointOfIntersection) {
    oldAnchorClone && (oldAnchorClone.rightSibling = newVertex);
    const newVertices = vertices.map(function replaceAnchorVertex(oldVertex) {
      return oldVertex.vertexNo == oldAnchorClone?.vertexNo
        ? oldAnchorClone
        : oldVertex;
    });
    newVertices.push(newVertex);

    return { newVertices, newAnchor: newVertex };
  }

  const newVertices = vertices.map(
    function setAnchorRightSiblingToPointOfIntersection(oldVertex) {
      const isAnchor = oldVertex.vertexNo == oldAnchorClone?.vertexNo;
      if (isAnchor) {
        const temporalVertex = { ...oldVertex };
        temporalVertex.rightSibling = pointOfIntersection;

        return temporalVertex;
      }

      return oldVertex;
    }
  );

  return { newVertices, newAnchor: pointOfIntersection };
}

function addVertex(
  vertices: ILinkedVertex[],
  newVertex: ILinkedVertex,
  anchor?: ILinkedVertex
) {
  const pointOfIntersection = getVertexAtIntersection(vertices, newVertex);

  if (!pointOfIntersection) {
    const newVertices = vertices.map(function replaceAnchorVertex(oldVertex) {
      return oldVertex.vertexNo == anchor?.vertexNo ? anchor : oldVertex;
    });
    newVertices.push(newVertex);

    return { newVertices, newAnchor: newVertex };
  }

  const newVertices = vertices.map(function linkAnchorToIntersectingVertex(
    oldVertex
  ) {
    if (oldVertex.vertexNo == anchor?.vertexNo) {
      const temporalVertex = { ...oldVertex };
      temporalVertex.rightSibling = pointOfIntersection;

      return temporalVertex;
    }

    return oldVertex;
  });

  return { newVertices, newAnchor: pointOfIntersection };
}

function createVertexNo(vertices: ILinkedVertex[]) {
  const lastVertex = Math.max(...vertices.map(({ vertexNo }) => vertexNo));

  return isFinite(lastVertex) ? lastVertex + 1 : 0;
}

function draw(vertices: ILinkedVertex[], ctx: CanvasRenderingContext2D | null) {
  const sortedVertices = vertices.sort(
    (vertexA, vertexB) => vertexA.vertexNo - vertexB.vertexNo
  );
  const firstVertex = first(sortedVertices);

  if (!firstVertex || !ctx) return;

  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(firstVertex.x, firstVertex.y);
  ctx.arc(firstVertex.x, firstVertex.y, 3, 0, Math.PI * 2);

  vertices.forEach(function drawLineToRightSibling({ rightSibling }) {
    if (rightSibling) {
      ctx.lineTo(rightSibling.x, rightSibling.y);
      ctx.arc(rightSibling.x, rightSibling.y, 3, 0, Math.PI * 2);
      console.log('rightSibling ', rightSibling);
    }
  });

  ctx.strokeStyle = 'black';
  ctx.stroke();
}

function getXCord(e: MouseEvent<HTMLCanvasElement>) {
  const canvasRect = e.currentTarget.getBoundingClientRect();
  return e.clientX - canvasRect.left;
}

function getYCord(e: MouseEvent<HTMLCanvasElement>) {
  const canvasRect = e.currentTarget.getBoundingClientRect();
  return e.clientY - canvasRect.top;
}

function getVertexAtIntersection(
  vertices: ILinkedVertex[],
  testVertex: IVertex
) {
  return vertices.find(
    ({ x, y }) =>
      Math.abs(x - testVertex.x) < 5 && Math.abs(y - testVertex.y) < 5
  );
}

export const polygon = {
  createVertex,
  createVertexNo,
  draw,
  getXCord,
  getYCord,
  getVertexAtIntersection,
  addVertex,
  createVertexV2,
};
