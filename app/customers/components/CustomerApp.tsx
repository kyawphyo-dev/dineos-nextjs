"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LandingScreen from "./LandingScreen";
import MenuScreen from "./MenuScreen";
import OrdersScreen from "./OrdersScreen";
import type { CartItem, Screen } from "../types";

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const SCREEN_ORDER: Screen[] = ["landing", "menu", "orders"];

export default function CustomerApp() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [prevScreen, setPrevScreen] = useState<Screen>("landing");
  const [cart, setCart] = useState<CartItem[]>([]);

  const direction =
    SCREEN_ORDER.indexOf(screen) >= SCREEN_ORDER.indexOf(prevScreen) ? 1 : -1;

  const navigate = (to: Screen) => {
    setPrevScreen(screen);
    setScreen(to);
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "100dvh" }}>
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={screen}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
          className="absolute inset-0 w-full"
          style={{ minHeight: "100dvh" }}
        >
          {screen === "landing" && (
            <LandingScreen onStart={() => navigate("menu")} />
          )}
          {screen === "menu" && (
            <MenuScreen
              cart={cart}
              onUpdateCart={setCart}
              onBack={() => navigate("landing")}
              onViewOrders={() => navigate("orders")}
            />
          )}
          {screen === "orders" && (
            <OrdersScreen
              cart={cart}
              onBack={() => navigate("menu")}
              onAddMore={() => navigate("menu")}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
