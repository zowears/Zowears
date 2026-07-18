import { Hero } from "@/components/sections/Hero";
import { Categories } from "@/components/sections/Categories";
import { Trending } from "@/components/sections/Trending";
import { Story } from "@/components/sections/Story";
import { Countdown } from "@/components/sections/Countdown";
import { Reviews } from "@/components/sections/Reviews";
import { Gallery } from "@/components/sections/Gallery";
import { Newsletter } from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      {/* <Trending /> */}
      <Story />
      {/* <Countdown /> */}
      {/* <Reviews /> */}
      <Gallery />
      <Newsletter />
    </>
  );
}
