"use client"

import { cn } from "@/lib/utils"
import { CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-700/[0.2] dark:text-emerald-500 px-1 py-0.5",
        className
      )}
    >
      {children}
    </span>
  );
};

const CARDS = [
  {
    id: 0,
    name: "Sarah Chen",
    designation: "CFO, TechStart Inc.",
    content: (
      <p>
        <Highlight>Financbase</Highlight> has completely transformed our financial operations. The AI-powered insights are{" "}
        <Highlight>incredibly accurate</Highlight> and help us make data-driven decisions faster than ever before.
      </p>
    ),
  },
  {
    id: 1,
    name: "Marcus Rodriguez",
    designation: "Finance Director, GrowthCorp",
    content: (
      <p>
        The <Highlight>real-time analytics</Highlight> and automated reporting features have saved us hours every week. The dashboard is both{" "}
        <Highlight>intuitive and powerful</Highlight>, giving us complete visibility into our financial health.
      </p>
    ),
  },
  {
    id: 2,
    name: "David Kim",
    designation: "VP Finance, ScaleUp Ventures",
    content: (
      <p>
        After implementing <Highlight>Financbase</Highlight>, our team processes financial data 60% faster. The seamless integrations and{" "}
        <Highlight>predictive analytics</Highlight> have made it an essential tool for our growing business.
      </p>
    ),
  },
];

const integrations = [
  {
    name: "QuickBooks",
    desc: "Sync your accounting data seamlessly with automated reconciliation",
    icon: "📊",
  },
  {
    name: "Stripe",
    desc: "Track payments and revenue streams in real-time",
    icon: "💳",
  },
  {
    name: "Xero",
    desc: "Connect your accounting software for unified financial management",
    icon: "📈",
  },
  {
    name: "Bank APIs",
    desc: "Direct bank connectivity for instant transaction updates",
    icon: "🏦",
  }
];

export default function PremiumFeaturesShowcase() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Left Block */}
        <div className="flex flex-col items-start justify-center border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          {/* Card */}
          <div className="relative w-full mb-4 sm:mb-6">
            <div className="absolute inset-x-0 -bottom-2 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-10"></div>
            <CardStack items={CARDS} />
          </div>

          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-900 dark:text-white leading-relaxed">
            Intuitive Financial Dashboard Experience <span className="text-primary">Financbase</span>{" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg"> Simplify your financial operations with our beautifully designed analytics platform that provides actionable insights out of the box.</span>
          </h3>
        </div>

        {/* Right Block */}
        <div className="flex flex-col items-center justify-start border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
          {/* Content */}
          <h3 className="text-lg sm:text-xl lg:text-2xl font-normal text-gray-900 dark:text-white mb-4 sm:mb-6 leading-relaxed">
            Seamless Financial Integration Ecosystem <span className="text-primary">Financbase</span>{" "}
            <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg"> Integrate effortlessly with your existing financial tools using Financbase's smart API-ready architecture and eliminate data silos in seconds.</span>
          </h3>
          <div
            className={cn(
              "group relative mt-auto w-full inline-flex animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-white dark:bg-black px-4 sm:px-6 lg:px-8 py-2 font-medium text-primary-foreground transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",

              // before styles
              "before:absolute before:bottom-[8%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
            )}
          >
            {/* Integration List */}
            <CardContent className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl z-10 w-full">
              {integrations.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                  <button type="button" className="rounded-full border border-gray-200 dark:border-gray-700 p-1.5 sm:p-2 text-xs font-semibold flex-shrink-0 ml-2"><Heart className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                </div>
              ))}
            </CardContent>
          </div>
        </div>
      </div>
      
      {/* Stats and Testimonial Section */}
      <div className="mt-12 sm:mt-16 lg:mt-20 grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 w-full text-center sm:text-left">
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white">+2.5K</div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400">Active Businesses</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white">$50M+</div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400">Transactions Processed</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white">99.9%</div>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400">Uptime Guarantee</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <blockquote className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 sm:pl-6 lg:pl-8 text-gray-700 dark:text-gray-400">
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed">Using Financbase has been like unlocking a new level of financial intelligence. It's the perfect fusion of simplicity and power, enabling us to make smarter business decisions with confidence.</p>
            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <cite className="block font-medium text-sm sm:text-base text-gray-900 dark:text-white">Jennifer Walsh, CEO</cite>
              <Image 
                className="h-8 sm:h-10 w-fit dark:invert" 
                src="https://opencv.org/wp-content/uploads/2022/05/logo.png" 
                alt="Company Logo" 
                height={40} 
                width={100} 
              />
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

let interval: NodeJS.Timeout | undefined;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  const startFlipping = useCallback(() => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        const lastElement = newArray.pop();
        if (lastElement) {
          newArray.unshift(lastElement); // move the last element to the front
        }
        return newArray;
      });
    }, 5000);
  }, []);

  useEffect(() => {
    startFlipping();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [startFlipping]);

  return (
    <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4">

      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute dark:bg-black bg-white h-48 w-full md:h-48 md:w-96 rounded-3xl p-4 shadow-xl border border-neutral-200 dark:border-white/[0.1] flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, //  decrease z-index for the cards that are behind
            }}
          >
            <div className="font-normal text-neutral-700 dark:text-neutral-200">
              {card.content}
            </div>
            <div>
              <p className="text-neutral-500 font-medium dark:text-white">
                {card.name}
              </p>
              <p className="text-neutral-400 font-normal dark:text-neutral-200">
                {card.designation}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
