"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Highlight } from "./hero-highlight";

export const HeroParallax = ({
  products,
}: {
  products: {
    title: string;
    link: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );
  return (
    <div
      ref={ref}
      className="h-[225vh] py-40 overflow-hidden  antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] dark"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="dark"
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row  mb-20 space-x-20 ">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl absolute mx-auto py-20 md:py-40 px-4 w-full left-0 top-20 flex items-center justify-between">
      {/* <Image
  src="/assets/image.png" 
  height="100"
          width="60"
          className="rounded-full absolute -top-[10%] left-5"
          alt={"h"}
/> */}

<div className="text-white absolute -top-[10%] left-7 font-[1000] text-4xl">
  <h1>
    Ds
  </h1>
</div>


      {/* </Image> */}
      <div className="ml-[190px]">
        <h1 className="text-2xl md:text-8xl font-bold dark:text-white ">
          DataSculpt <br />
        </h1>
        <p className="max-w-1xl mt-[24px] dark:text-neutral-200 text-2xl px-4 md:text-3xl lg:text-4xl font-bold text-neutral-700 dark:text-white leading-relaxed lg:leading-snug whitespace-nowrap">
          Helping you get your dataset <br />
          <Highlight className="text-black dark:text-white mt-3">
            prepared with ease.
          </Highlight>
        </p>
        
        <div className="mt-10 flex gap-4 items-center justify-center w-full ml-[-50px]">
          {/* Creator Dashboard Button */}
          <Link href="/creators/tasks">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white px-6 py-3 rounded-lg shadow-lg font-semibold border-white border-2"
            >
              Creator Dashboard
            </motion.button>
          </Link>

          {/* Worker Dashboard Button */}
          <Link href="/worker/tasks">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-6 py-3 rounded-lg shadow-lg font-semibold border-black border-2"
            >
              Worker Dashboard
            </motion.button>
          </Link>
        </div>
      </div>
      <div className="flex-[1] ml-[200px] w-[400px]">
        <dotlottie-player
          src="https://lottie.host/b05c7036-faf5-4212-9e3d-a6178c82ec02/QbVm9VqpRb.json"
          background="transparent"
          speed="1"
          style={{ width: "400px" }}
          loop
          autoplay
        ></dotlottie-player>
      </div>
    </div>
  );
};



export const ProductCard = ({
  product,
  translate,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative flex-shrink-0"
    >
      <Link
        href={product.link}
        className="block group-hover/product:shadow-2xl "
      >
        <Image
          src={product.thumbnail}
          height="300"
          width="600"
          className="absolute h-[300px] border-2 border-gray-600 rounded-lg w-full inset-0"
          alt={product.title}
        />
      </Link>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
        {product.title}
      </h2>
    </motion.div>
  );
};
