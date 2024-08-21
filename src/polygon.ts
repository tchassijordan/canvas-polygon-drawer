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
    const newVertices = vertices.map(function setAnchorRightSiblingToNewVertex(oldVertex) {
      if (oldVertex.vertexNo == oldAnchor?.vertexNo) {
        oldVertex.rightSibling = newVertex
      }

      return oldVertex
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

function createVertexNo(vertices: ILinkedVertex[]) {
  const lastVertex = Math.max(...vertices.map(({ vertexNo }) => vertexNo));

  return isFinite(lastVertex) ? lastVertex + 1 : 0;
}

function draw(vertices: ILinkedVertex[], ctx: CanvasRenderingContext2D | null, strokeWidth?: number, color?: string) {
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

  ctx.strokeStyle = color ?? 'black';
  ctx.lineWidth = strokeWidth ?? 1
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
};
