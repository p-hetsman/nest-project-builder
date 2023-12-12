'use client';

import Konva from 'konva';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import React, { useRef } from 'react';
import { Layer, Stage } from 'react-konva';

function Canvas({ data }) {
    const dragUrl = data;
    const stageRef = useRef<any>(null);
    const layerRef = useRef<any>(null);

    const onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();

        if (stageRef.current) {
            const stage = stageRef.current;

            stage.setPointersPositions(e);

            Konva.Image.fromURL(dragUrl, image => {
                if (layerRef.current) {
                    const layer = layerRef.current;

                    layer.add(image);

                    image.position(stage.getPointerPosition());
                    image.draggable(true);
                    image.stroke('red');
                    image.strokeWidth(2);
                }
            });

            if (layerRef.current) {
                layerRef.current.on('mouseover', evt => {
                    const shape = evt.target as Shape<ShapeConfig>;
                    document.body.style.cursor = 'pointer';
                    shape.strokeEnabled(true);
                });

                layerRef.current.on('mouseout', evt => {
                    const shape = evt.target as Shape<ShapeConfig>;
                    document.body.style.cursor = 'default';
                    shape.strokeEnabled(false);
                });
            }
        }
    };
    return (
        <div>
            <div onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e)}>
                <Stage
                    height={window.innerHeight}
                    ref={stageRef}
                    style={{ border: '1px solid grey' }}
                    width={window.innerWidth}
                >
                    <Layer ref={layerRef} />
                </Stage>
            </div>
        </div>
    );
}

export default Canvas;
