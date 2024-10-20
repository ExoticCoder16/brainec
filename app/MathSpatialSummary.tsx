import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

type NodeID = string;

type Edge = {
  source: NodeID,
  target: NodeID
};

enum NodeType {
  Formula = "formula",
  Text = "text",
}

interface NodeStyle {
  color?: string,
  fontSize?: number,
  maxWidth?: string
}

type NodeBase = {
  id: NodeID,
  x: number,
  y: number,
  style?: NodeStyle
}

type NodeFormula = NodeBase & {
  latex: string,
  type: NodeType.Formula
}

type NodeText = NodeBase & {
  content: string,
  type: NodeType.Text
}

type Node = NodeFormula | NodeText;

type StoryAI = {
  edges: Edge[],
  nodes: Node[]
}

interface MathSpatialSummaryProps {
  data: StoryAI;
}

const MathSpatialSummary: React.FC<MathSpatialSummaryProps> = ({ data }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

    React.useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight
            });
        }
    }, []);

    const layoutNodes = (nodes: Node[]) => {
        const levels: Node[][] = [];
        nodes.forEach(node => {
            const level = Math.floor((node.y + 330) / 100); // Adjust this value to change vertical spacing
            if (!levels[level]) levels[level] = [];
            levels[level].push(node);
        });

        return levels.flatMap((levelNodes, levelIndex) => {
            const levelWidth = dimensions.width;
            const nodeSpacing = levelWidth / (levelNodes.length + 1);
            return levelNodes.map((node, index) => ({
                ...node,
                x: (index + 1) * nodeSpacing,
                y: levelIndex * 100 + 50 // Adjust this value to change vertical spacing
            }));
        });
    };

    const scaledNodes = layoutNodes(data.nodes);

    const renderEdge = (edge: Edge) => {
        const sourceNode = scaledNodes.find(n => n.id === edge.source);
        const targetNode = scaledNodes.find(n => n.id === edge.target);
        
        if (!sourceNode || !targetNode) return null;

        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;

        const path = `M${sourceNode.x},${sourceNode.y} Q${midX},${midY} ${targetNode.x},${targetNode.y}`;

        return (
            <path
                key={`${edge.source}-${edge.target}`}
                d={path}
                fill="none"
                stroke="#999999"
                strokeWidth="1"
            />
        );
    };

    const renderNode = (node: Node) => {
        const nodeStyle: React.CSSProperties = {
            position: 'absolute',
            left: `${node.x}px`,
            top: `${node.y}px`,
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            ...(node.style || {}),
            whiteSpace: 'normal',
            maxWidth: '200px',
            backgroundColor: 'white',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: node.type === NodeType.Formula ? '16px' : '14px'
        };

        let content: React.ReactNode;

        if (node.type === NodeType.Formula) {
            content = <InlineMath math={(node as NodeFormula).latex} />;
        } else if ((node as NodeText).content.toLowerCase().includes("theorem")) {
            content = <strong style={{ fontSize: '18px' }}>{(node as NodeText).content}</strong>;
        } else if ((node as NodeText).content.toLowerCase().includes("proof")) {
            content = <em style={{ fontSize: '16px' }}>{(node as NodeText).content}</em>;
        } else {
            content = (node as NodeText).content;
        }

        return (
            <div key={node.id} style={nodeStyle}>
                {content}
            </div>
        );
    };

    return (
        <div 
            ref={containerRef}
            style={{ 
                width: '100%', 
                height: '600px', 
                position: 'relative',
                margin: '20px auto',
                fontFamily: 'Arial, sans-serif',
                overflow: 'visible',
                backgroundColor: '#f0f0f0'
            }}
        >
            <svg width="100%" height="100%" style={{position: 'absolute', top: 0, left: 0}}>
                {data.edges.map(renderEdge)}
            </svg>
            {scaledNodes.map(renderNode)}
        </div>
    );
};

export default MathSpatialSummary;