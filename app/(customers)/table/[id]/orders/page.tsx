"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { useOrders } from "@/context/OrdersContext";
import ROUTES from "@/route";
import OrderCard from "@/app/customers/components/OrderCard";



export default function OrdersPage() {
  const router = useRouter();
  const { orders } = useOrders();

  // Show most recently placed orders first
  const sortedOrders = [...orders].reverse();

  return (
    <div className="flex flex-col min-h-screen bg-cream">

      <div className="bg-bark px-5 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push("/menu")}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10"
        >
          <ChevronLeft className="w-4 h-4 text-white/80" />
        </button>
        <span className="text-[16px] font-medium text-white">My Orders</span>
        <span className="ml-auto text-[12px] text-white/55">Table A-07</span>
      </div>

      <div className="flex-1 px-5 py-4 flex flex-col gap-3">
        {sortedOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {sortedOrders.length === 0 && (
          <div className="text-center py-16 text-text-hint text-[14px]">
            No orders yet. Place an order from the menu to see it here.
          </div>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-2.5 border-t border-black/8 bg-cream">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(ROUTES.CUSTOMER_MENU("A-07"))}
          className="w-full border-[1.5px] border-clay text-clay rounded-2xl py-3 text-[14px] font-medium flex items-center justify-center gap-2 active:bg-clay-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          Order more
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full bg-clay text-white rounded-2xl py-3.5 text-[15px] font-medium flex items-center justify-center gap-2 active:bg-clay-dark transition-colors"
        >
          <Receipt className="w-4 h-4" />
          Request bill
        </motion.button>
      </div>
    </div>
  );
}




// const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
//   { key: "received", label: "Order received" },
//   { key: "preparing", label: "Kitchen preparing" },
//   { key: "ready", label: "Ready to serve" },
// ];

// const STATUS_INDEX: Record<OrderStatus, number> = {
//   received: 0,
//   preparing: 1,
//   ready: 2,
//   served: 3,
// };

// function StatusBadge({ status }: { status: OrderStatus }) {
//   const styles: Record<OrderStatus, string> = {
//     received: "bg-clay-light text-clay-dark",
//     preparing: "bg-gold-light text-[#9A6C10]",
//     ready: "bg-sage-light text-sage",
//     served: "bg-green-light text-green",
//   };
//   const labels: Record<OrderStatus, string> = {
//     received: "Received",
//     preparing: "Preparing",
//     ready: "Ready",
//     served: "Served"
//   };
//   return (
//     <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${styles[status]}`}>
//       {labels[status]}
//     </span>
//   );
// }

// function OrderCard({ order }: { order: Order }) {
//   const currentStep = STATUS_INDEX[order.status];
//   const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);

//   return (
//     <div className="bg-white rounded-2xl border border-black/8 p-4">
//       <div className="flex items-center justify-between mb-4">
//         <span className="text-[12px] text-text-hint">Order #{order.id}</span>
//         <StatusBadge status={order.status} />
//       </div>

//       <div className="flex flex-col gap-0 mb-4">
//         {STATUS_STEPS.map((step, i) => {
//           const isDone = i < currentStep;
//           const isActive = i === currentStep;
//           const isLast = i === STATUS_STEPS.length - 1;

//           return (
//             <div key={step.key} className="flex gap-3">
//               <div className="flex flex-col items-center">
//                 <motion.div
//                   initial={isActive ? { scale: 0.8 } : false}
//                   animate={isActive ? { scale: [0.8, 1.1, 1] } : {}}
//                   transition={{ duration: 0.4 }}
//                   className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
//                     isDone
//                       ? "bg-clay text-white"
//                       : isActive
//                       ? "bg-gold text-white"
//                       : "bg-cream-dark text-text-hint border-[1.5px] border-black/15"
//                   }`}
//                 >
//                   {isDone ? (
//                     <Check className="w-2.5 h-2.5" />
//                   ) : isActive ? (
//                     <Flame className="w-2.5 h-2.5" />
//                   ) : (
//                     <span>{i + 1}</span>
//                   )}
//                 </motion.div>
//                 {!isLast && (
//                   <div className={`w-px flex-1 my-0.5 min-h-[20px] ${isDone ? "bg-clay/40" : "bg-black/10"}`} />
//                 )}
//               </div>
//               <div className="pb-4">
//                 <p className="text-[13px] font-medium text-text-primary">{step.label}</p>
//                 <p className="text-[11px] text-text-hint mt-0.5">
//                   {isDone
//                     ? order.placedAt
//                     : isActive
//                     ? `In progress · ~${order.estimatedMin} min`
//                     : "Waiting…"}
//                 </p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="border-t border-black/8 pt-3 flex flex-col gap-2">
//         {order.items.map((item, i) => (
//           <div key={i} className="flex items-start justify-between">
//             <div>
//               <p className="text-[13px] text-text-primary">{item.name}</p>
//               <p className="text-[12px] text-text-hint">× {item.qty}</p>
//             </div>
//             <p className="text-[13px] font-medium text-clay-dark">฿{item.price * item.qty}</p>
//           </div>
//         ))}
//         <div className="border-t border-black/8 pt-2.5 mt-1 flex justify-between items-center">
//           <span className="text-[13px] font-medium text-text-muted">Order total</span>
//           <span className="text-[16px] font-medium text-clay-dark">฿{total}</span>
//         </div>
//       </div>
//     </div>
//   );
// }
