"use client";
import {
  type MouseEvent,
  type TouchEvent,
  ReactElement,
  useEffect,
  useRef,
} from "react";
import { Tools, themeType } from "../../types";
import { rgbToHex } from "../../utils";

// shapes and tools
import { pencil } from "./shapes/tools/pencil";
import { circle } from "./shapes/circle";
import { rectangle } from "./shapes/rectangle";
import { triangle } from "./shapes/triangle";
import { eraser } from "./shapes/tools/eraser";
import { arrow } from "./shapes/arrow";

// save system
import { saveAnnotationPage } from "./saveSystem/saveAnnotation";
import { clearCanvas } from "./saveSystem/clearCanvas";
import { setStorageSnapshotAnnotation } from "./saveSystem/setStorageSnapshotAnnotation";
import { removeCanvas } from "./saveSystem/removeCanvas";

export default function AnnotationCanvas({
  bookIndex,
  mouseDown,
  setMouseDown,
  color,
  currentPage,
  tool,
  showAnnotation,
}: {
  bookIndex: number;
  mouseDown: boolean;
  setMouseDown: Function;
  color: themeType;
  currentPage: number;
  tool: Tools;
  showAnnotation: boolean;
}): ReactElement {
  const initPos = useRef<{ x: number; y: number } | null>(null);
  const prevPoint = useRef<{ x: number; y: number } | null>(null);
  const snapshot = useRef<ImageData | null>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);

  const getCanvas = () => annotationCanvasRef.current;

  const computePointInCanvas = (clientX: number, clientY: number) => {
    const canvas = getCanvas();
    if (!canvas) return { x: clientX, y: clientY };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const getEventPosition = (e: MouseEvent | TouchEvent) => {
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return computePointInCanvas(clientX, clientY);
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    currentPos: { x: number; y: number },
  ) => {
    if (!initPos.current || !prevPoint.current) return;

    switch (tool) {
      case Tools.PENCIL:
        pencil(ctx, currentPos, color, 5);
        break;
      case Tools.MARKER:
        pencil(ctx, currentPos, color, 10, 0.5);
        break;
      case Tools.CIRCLE:
        circle(ctx, initPos.current, currentPos);
        break;
      case Tools.RECTANGLE:
        rectangle(ctx, initPos.current, currentPos);
        break;
      case Tools.TRIANGLE:
        triangle(ctx, initPos.current, currentPos);
        break;
      case Tools.ARROW:
        arrow(ctx, initPos.current, currentPos);
        break;
      case Tools.ERASER:
        eraser(ctx, currentPos, 64);
        break;
    }
  };

  const handlerMouseDown = (e: MouseEvent | TouchEvent) => {
    const canvas = getCanvas();
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getEventPosition(e);

    initPos.current = { x, y };
    snapshot.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = rgbToHex(color.fg);

    setMouseDown(true);
  };

  const handlerMouseUp = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    saveAnnotationPage(bookIndex, currentPage, canvas);
    setMouseDown(false);
    prevPoint.current = null;
  };

  const handlerMove = (e: MouseEvent | TouchEvent) => {
    const canvas = getCanvas();
    const ctx = canvas?.getContext("2d");

    if (!ctx || !mouseDown || !showAnnotation || !snapshot.current) return;

    e.preventDefault();
    e.stopPropagation();

    ctx.putImageData(snapshot.current, 0, 0);

    const currentPos = getEventPosition(e);
    draw(ctx, currentPos);
    prevPoint.current = currentPos;
  };

  const redraw = () => {
    const canvas = getCanvas();
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    clearCanvas(canvas, ctx);
    setStorageSnapshotAnnotation(bookIndex, currentPage, ctx);
  };

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (snapshot.current) return;
    redraw();
  });

  useEffect(() => {
    const canvas = getCanvas();
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || tool !== Tools.CLEAR_CANVAS) return;

    clearCanvas(canvas, ctx);
    removeCanvas(bookIndex, currentPage);
  }, [tool]);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const preventScroll = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };

    canvas.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  return (
    <canvas
      ref={annotationCanvasRef}
      onMouseDown={handlerMouseDown}
      onMouseUp={handlerMouseUp}
      onMouseMove={handlerMove}
      onTouchStart={handlerMouseDown}
      onTouchEnd={handlerMouseUp}
      onTouchMove={handlerMove}
      className="absolute z-10 top-0 left-0 w-full h-full touch-none"
    />
  );
}
