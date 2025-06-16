// "use client";

// import { motion, useMotionTemplate, useMotionValue } from "motion/react";
// import React, { useCallback, useEffect, useRef } from "react";

// import { cn } from "@/lib/utils";

// interface MagicCardProps {
//   children?: React.ReactNode;
//   className?: string;
//   gradientSize?: number;
//   gradientColor?: string;
//   gradientOpacity?: number;
//   gradientFrom?: string;
//   gradientTo?: string;
// }

// export function MagicCard({
//   children,
//   className,
//   gradientSize = 200,
//   gradientColor = "#262626",
//   gradientOpacity = 0.8,
//   gradientFrom = "#9E7AFF",
//   gradientTo = "#FE8BBB",
// }: MagicCardProps) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const mouseX = useMotionValue(-gradientSize);
//   const mouseY = useMotionValue(-gradientSize);

//   const handleMouseMove = useCallback(
//     (e: MouseEvent) => {
//       if (cardRef.current) {
//         const { left, top } = cardRef.current.getBoundingClientRect();
//         const clientX = e.clientX;
//         const clientY = e.clientY;
//         mouseX.set(clientX - left);
//         mouseY.set(clientY - top);
//       }
//     },
//     [mouseX, mouseY],
//   );

//   const handleMouseOut = useCallback(
//     (e: MouseEvent) => {
//       if (!e.relatedTarget) {
//         document.removeEventListener("mousemove", handleMouseMove);
//         mouseX.set(-gradientSize);
//         mouseY.set(-gradientSize);
//       }
//     },
//     [handleMouseMove, mouseX, gradientSize, mouseY],
//   );

//   const handleMouseEnter = useCallback(() => {
//     document.addEventListener("mousemove", handleMouseMove);
//     mouseX.set(-gradientSize);
//     mouseY.set(-gradientSize);
//   }, [handleMouseMove, mouseX, gradientSize, mouseY]);

//   useEffect(() => {
//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseout", handleMouseOut);
//     document.addEventListener("mouseenter", handleMouseEnter);

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseout", handleMouseOut);
//       document.removeEventListener("mouseenter", handleMouseEnter);
//     };
//   }, [handleMouseEnter, handleMouseMove, handleMouseOut]);

//   useEffect(() => {
//     mouseX.set(-gradientSize);
//     mouseY.set(-gradientSize);
//   }, [gradientSize, mouseX, mouseY]);

//   return (
//     <div
//       ref={cardRef}
//       className={cn("group relative rounded-[inherit]", className)}
//     >
//       <motion.div
//         className="pointer-events-none absolute inset-0 rounded-[inherit] bg-border duration-300 group-hover:opacity-100"
//         style={{
//           background: useMotionTemplate`
//           radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
//           ${gradientFrom}, 
//           ${gradientTo}, 
//           var(--border) 100%
//           )
//           `,
//         }}
//       />
//       <div className="absolute inset-px rounded-[inherit] bg-background" />
//       <motion.div
//         className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
//         style={{
//           background: useMotionTemplate`
//             radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
//           `,
//           opacity: gradientOpacity,
//         }}
//       />
//       <div className="relative">{children}</div>
//     </div>
//   );
// }

"use client";

import { cn } from "@/lib/utils";
import { CSSProperties, ReactElement, ReactNode, useEffect, useRef, useState } from "react";

interface MousePosition {
    x: number;
    y: number;
}

function useMousePosition(): MousePosition {
    const [mousePosition, setMousePosition] = useState<MousePosition>({
        x: 0,
        y: 0,
    });

    useEffect(() => {
        const handleMouseMove = (event: globalThis.MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return mousePosition;
}

interface MagicContainerProps {
    children?: ReactNode;
    className?: any;
}

const MagicContainer = ({ children, className }: MagicContainerProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mousePosition = useMousePosition();
    const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const containerSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const [boxes, setBoxes] = useState<Array<HTMLElement>>([]);

    useEffect(() => {
        init();
        containerRef.current &&
            setBoxes(Array.from(containerRef.current.children).map(el => el as HTMLElement));
    }, []);

    useEffect(() => {
        init();
        window.addEventListener("resize", init);

        return () => {
            window.removeEventListener("resize", init);
        };
    }, [setBoxes]);

    useEffect(() => {
        onMouseMove();
    }, [mousePosition]);

    const init = () => {
        if (containerRef.current) {
            containerSize.current.w = containerRef.current.offsetWidth;
            containerSize.current.h = containerRef.current.offsetHeight;
        }
    };

    const onMouseMove = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const { w, h } = containerSize.current;
            const x = mousePosition.x - rect.left;
            const y = mousePosition.y - rect.top;
            const inside = x < w && x > 0 && y < h && y > 0;

            mouse.current.x = x;
            mouse.current.y = y;
            boxes.forEach(box => {
                const boxX = -(box.getBoundingClientRect().left - rect.left) + mouse.current.x;
                const boxY = -(box.getBoundingClientRect().top - rect.top) + mouse.current.y;
                box.style.setProperty("--mouse-x", `${boxX}px`);
                box.style.setProperty("--mouse-y", `${boxY}px`);

                if (inside) {
                    box.style.setProperty("--opacity", `1`);
                } else {
                    box.style.setProperty("--opacity", `0`);
                }
            });
        }
    };

    return (
        <div className={cn("h-full w-full", className)} ref={containerRef}>
            {children}
        </div>
    );
};

interface MagicCardProps {
    /**
     * @default <div />
     * @type ReactElement
     * @description
     * The component to be rendered as the card
     * */
    as?: ReactElement;
    /**
     * @default ""
     * @type string
     * @description
     * The className of the card
     */
    className?: string;

    /**
     * @default ""
     * @type ReactNode
     * @description
     * The children of the card
     * */
    children?: ReactNode;

    /**
     * @default 600
     * @type number
     * @description
     * The size of the spotlight effect in pixels
     * */
    size?: number;

    /**
     * @default true
     * @type boolean
     * @description
     * Whether to show the spotlight
     * */
    spotlight?: boolean;

    /**
     * @default "rgba(255,255,255,0.03)"
     * @type string
     * @description
     * The color of the spotlight
     * */
    spotlightColor?: string;

    /**
     * @default true
     * @type boolean
     * @description
     * Whether to isolate the card which is being hovered
     * */
    isolated?: boolean;

    /**
     * @default "rgba(255,255,255,0.03)"
     * @type string
     * @description
     * The background of the card
     * */
    background?: string;

    [key: string]: any;
}

const MagicCard: React.FC<MagicCardProps> = ({
    className,
    children,
    size = 600,
    spotlight = true,
    borderColor = "hsl(0 0% 98%)",
    isolated = true,
    ...props
}) => {
    return (
        <div
            style={
                {
                    "--mask-size": `${size}px`,
                    "--border-color": `${borderColor}`,
                } as CSSProperties
            }
            className={cn(
                "relative z-0 h-full w-full rounded-2xl p-6",
                "bg-gray-300 dark:bg-gray-700",
                "bg-[radial-gradient(var(--mask-size)_circle_at_var(--mouse-x)_var(--mouse-y),var(--border-color),transparent_100%)]",
                className
            )}
            {...props}
        >
            {children}

            {/* Background */}
            <div className={"absolute inset-[1px] -z-20 rounded-2xl bg-white dark:bg-black/95"} />
        </div>
    );
};

export { MagicCard, MagicContainer };
