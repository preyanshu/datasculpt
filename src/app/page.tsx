// "use client";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";

// function Page() {
//   return (
//     <HeroHighlight className="min-h-screen flex justify-center items-center">
//       {/* Left Side: Text and Buttons */}
//       <div className="flex-[3] flex flex-col justify-center items-start text-center max-w-3xl">
//         {/* Tagline Animation */}
//         <motion.h1
//           initial={{
//             opacity: 0,
//             y: 20,
//           }}
//           animate={{
//             opacity: 1,
//             y: [20, -5, 0],
//           }}
//           transition={{
//             duration: 0.5,
//             ease: [0.4, 0.0, 0.2, 1],
//           }}
//           className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white leading-relaxed lg:leading-snug"
//         >
//           <span className="mt-6">
//             Helping you get your dataset <br />{" "}
//           </span>

//           <Highlight className="text-black dark:text-white mt-3">
//             prepared with ease.
//           </Highlight>
//         </motion.h1>

//         {/* Buttons for navigation */}
//         <div className="mt-10 flex gap-4 items-center justify-center w-full -ml-10">
//           {/* Creator Dashboard Button */}
//           <Link href="/creators/tasks">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="bg-black text-white px-6 py-3 rounded-lg shadow-lg font-semibold border-white border-2"
//             >
//               Creator Dashboard
//             </motion.button>
//           </Link>

//           {/* Worker Dashboard Button */}
//           <Link href="/worker/tasks">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               className="bg-white text-black px-6 py-3 rounded-lg shadow-lg font-semibold"
//             >
//               Worker Dashboard
//             </motion.button>
//           </Link>
//         </div>
//       </div>

//       {/* Right Side: Animation */}
//       <div className="flex-[1] -ml-20 w-[400px]">
//         <dotlottie-player
//           src="https://lottie.host/b05c7036-faf5-4212-9e3d-a6178c82ec02/QbVm9VqpRb.json"
//           background="transparent"
//           speed="1"
//           style={{ width: "100%" }}
//           loop
//           autoplay
//         ></dotlottie-player>
//       </div>
//     </HeroHighlight>
//   );
// }

// export default Page;

"use client";
import React from "react";
import { HeroParallax } from "@/components/ui/hero-parallax";

function HeroParallaxDemo() {
  return <HeroParallax products={products} />;
}

export default HeroParallaxDemo;

export const products = [

  {
    title: "Editorially",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/editorially.png",
  },
  {
    title: "Editrix AI",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/editrix.png",
  },
  {
    title: "Pixel Perfect",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/pixelperfect.png",
  },

  {
    title: "Algochurn",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/algochurn.png",
  },
  {
    title: "Aceternity UI",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/aceternityui.png",
  },
  {
    title: "Tailwind Master Kit",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png",
  },
  {
    title: "SmartBridge",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/smartbridge.png",
  },
  {
    title: "Renderwork Studio",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/renderwork.png",
  },

  {
    title: "Creme Digital",
    link: "#",
    thumbnail:
      "https://aceternity.com/images/products/thumbnails/new/cremedigital.png",
  }

];
