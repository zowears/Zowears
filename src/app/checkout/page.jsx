"use client";

import Image from "next/image";
import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Check, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  Inbox, 
  FileText, 
  ExternalLink, 
  Mail, 
  CheckCircle2,
  Calendar,
  CreditCard,
  Truck
} from "lucide-react";
import { useCart } from "@/context/cart";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";

const steps = ["Address", "Shipping", "Payment"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CheckoutPage() {
  const { items, resolve, subtotal, clear } = useCart();
  const [step, setStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [createdOrder, setCreatedOrder] = React.useState(null);
  const [successTab, setSuccessTab] = React.useState("receipt"); // "receipt" | "email"

  // Form State
  const [formData, setFormData] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  const [errors, setErrors] = React.useState({});

  // Shipping & Payment Selections
  const [shippingMethod, setShippingMethod] = React.useState("Standard");
  const [paymentMethod, setPaymentMethod] = React.useState("Credit Card");

  // Dynamic Shipping Cost
  const standardShippingCost = subtotal > 2499 ? 0 : 199;
  const shippingCost = shippingMethod === "Express" ? 299 : standardShippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user typess
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zip.trim()) newErrors.zip = "Zip code is required";
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[0-9\s-]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = "Invalid phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 0) {
      if (validateForm()) {
        setStep(1);
      } else {
        toast.error("Please complete all address details correctly.");
      }
    } else if (step === 1) {
      setStep(2);
    }
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        items: items.map(it => {
          const p = resolve(it);
          return {
            productId: it.productId,
            name: p?.name || "Silhouette Item",
            quantity: it.qty,
            price: p?.price || 0,
            size: it.size,
            color: it.color,
            image: p?.image || ""
          };
        }),
        totalAmount: subtotal + shippingCost,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          phone: formData.phone
        },
        shippingMethod,
        shippingCost,
        paymentMethod,
        paymentStatus: paymentMethod === "Cash on delivery" ? "pending" : "paid"
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      const data = await res.json();
      setCreatedOrder(data);
      clear(); // Clear the cart state
      toast.success("Order secured successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An error occurred while securing your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render: SUCCESS SCREEN ──────────────────────────────────────────────────
  if (createdOrder) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-24 md:px-8 md:pt-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent-red/10 border border-accent-red/20 text-accent-red">
              <CheckCircle2 className="h-10 w-10 animate-pulse" />
            </div>
          </div>
          
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl uppercase">
            Order Secured
          </h1>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
            Order ID: <span className="font-mono text-white/90">{createdOrder._id}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            A confirmation receipt has been generated and dispatched to <span className="text-white font-medium">{createdOrder.email}</span>.
          </p>

          {/* WhatsApp Confirmation Status */}
          <div className="mt-8 p-6 bg-emerald-950/10 border border-emerald-900/30 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 text-left max-w-4xl mx-auto backdrop-blur-sm">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.167 1.485 4.709 1.487 5.48.003 9.94-4.456 9.943-9.934.002-2.654-1.02-5.15-2.879-7.01C16.505 1.83 14.02 1.8 12.01 1.8c-5.485 0-9.94 4.457-9.944 9.934-.001 2.014.526 3.98 1.526 5.717L2.616 21.03l3.754-1.876zm12.353-5.26c-.307-.154-1.817-.897-2.097-.999-.281-.102-.485-.154-.69.154-.204.307-.79.999-.97 1.203-.178.205-.357.228-.665.074-3.05-1.524-4.22-2.228-5.918-5.132-.23-.393.23-.365.658-1.22.074-.153.037-.289-.018-.393-.056-.103-.485-1.172-.665-1.603-.175-.42-.379-.362-.519-.369-.134-.007-.289-.009-.444-.009-.155 0-.408.058-.62.289-.213.23-.815.797-.815 1.943 0 1.147.833 2.253.95 2.406.115.153 1.64 2.505 3.972 3.511 2.333 1.006 2.333.67 2.74.632.408-.038 1.817-.743 2.073-1.46.255-.717.255-1.33.178-1.458-.076-.128-.28-.205-.588-.359z"/>
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  WhatsApp Confirmation
                </h4>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-xl">
                  {createdOrder.whatsappSent ? (
                    <>
                      An automatic WhatsApp confirmation has been dispatched to your phone number <span className="font-semibold text-emerald-400">{createdOrder.shippingAddress?.phone}</span>.
                    </>
                  ) : (
                    <>
                      Order processed! Connect directly with us on WhatsApp to coordinate delivery or ask any questions.
                    </>
                  )}
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '923022401759'}?text=${encodeURIComponent(
                `Assalam-o-Alaikum / Hello Zowear,\n\nI would like to verify/chat about my order!\n\n*Order ID:* #${createdOrder._id}\n*Customer Name:* ${createdOrder.customerName}\n*Total Amount:* Rs. ${createdOrder.totalAmount}\n\nThank you!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto flex items-center justify-center gap-2 border border-emerald-500 bg-emerald-500 hover:bg-transparent hover:text-emerald-400 text-black font-bold uppercase tracking-[0.2em] px-6 py-3.5 text-[10px] transition-all duration-300 shrink-0"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.59-4.846c1.6.95 3.167 1.485 4.709 1.487 5.48.003 9.94-4.456 9.943-9.934.002-2.654-1.02-5.15-2.879-7.01C16.505 1.83 14.02 1.8 12.01 1.8c-5.485 0-9.94 4.457-9.944 9.934-.001 2.014.526 3.98 1.526 5.717L2.616 21.03l3.754-1.876zm12.353-5.26c-.307-.154-1.817-.897-2.097-.999-.281-.102-.485-.154-.69.154-.204.307-.79.999-.97 1.203-.178.205-.357.228-.665.074-3.05-1.524-4.22-2.228-5.918-5.132-.23-.393.23-.365.658-1.22.074-.153.037-.289-.018-.393-.056-.103-.485-1.172-.665-1.603-.175-.42-.379-.362-.519-.369-.134-.007-.289-.009-.444-.009-.155 0-.408.058-.62.289-.213.23-.815.797-.815 1.943 0 1.147.833 2.253.95 2.406.115.153 1.64 2.505 3.972 3.511 2.333 1.006 2.333.67 2.74.632.408-.038 1.817-.743 2.073-1.46.255-.717.255-1.33.178-1.458-.076-.128-.28-.205-.588-.359z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          {/* Tab Selector */}
          <div className="mt-12 flex justify-center border-b border-white/5">
            <button
              onClick={() => setSuccessTab("receipt")}
              className={`flex items-center gap-2 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all border-b-2 ${
                successTab === "receipt" 
                  ? "border-accent-red text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              Digital Receipt
            </button>
            <button
              onClick={() => setSuccessTab("email")}
              className={`flex items-center gap-2 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all border-b-2 ${
                successTab === "email" 
                  ? "border-accent-red text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-4 w-4" />
              Inbox Preview
            </button>
          </div>

          <div className="mt-12 text-left">
            {successTab === "receipt" ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-8 md:grid-cols-12"
              >
                {/* Shipping & Payment Details */}
                <div className="md:col-span-7 bg-white/5 border border-white/5 p-8 space-y-8">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-red mb-4">
                      Shipping Destination
                    </h3>
                    <div className="text-sm text-zinc-300 leading-relaxed font-light">
                      <p className="font-bold text-white mb-1">
                        {createdOrder.shippingAddress.firstName} {createdOrder.shippingAddress.lastName}
                      </p>
                      <p>{createdOrder.shippingAddress.address}</p>
                      <p>{createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.state} {createdOrder.shippingAddress.zip}</p>
                      <p className="mt-2 font-mono text-xs text-muted-foreground">Phone: {createdOrder.shippingAddress.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Shipping Option
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Truck className="h-4 w-4 text-accent-red" />
                        <span className="font-bold uppercase tracking-wider text-xs">
                          {createdOrder.shippingMethod}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
                        Payment Method
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-white">
                        <CreditCard className="h-4 w-4 text-accent-red" />
                        <span className="font-bold uppercase tracking-wider text-xs">
                          {createdOrder.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 text-xs text-muted-foreground leading-relaxed">
                    <p>Estimated Delivery: 3-5 business days.</p>
                    <p className="mt-1">For any queries, please email support@zowears.com with your Order ID.</p>
                  </div>
                </div>

                {/* Items & Price Summary */}
                <aside className="md:col-span-5 bg-white/2 border border-white/5 p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-red mb-6">
                      Silhouette Items
                    </h3>
                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {createdOrder.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          {item.image && (
                            <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-background border border-white/5">
                              <Image src={item.image} alt={item.name} fill sizes="60px" className="object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground truncate">
                              {item.name}
                            </div>
                            <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                              {item.size} · {item.color} · ×{item.quantity}
                            </div>
                          </div>
                          <div className="font-display text-sm font-bold text-white">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-6 space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(createdOrder.totalAmount - createdOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-accent-red">
                        {createdOrder.shippingCost === 0 ? "Complimentary" : formatPrice(createdOrder.shippingCost)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-white/5">
                      <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Total</span>
                      <span className="font-display text-2xl font-bold text-accent-red">
                        {formatPrice(createdOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </aside>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Live Ethereal Link Banner if available */}
                {createdOrder.emailPreviewUrl && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-accent-red/10 border border-accent-red/20 p-6 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Inbox className="h-6 w-6 text-accent-red" />
                      <div className="text-left">
                        <div className="text-xs font-bold uppercase tracking-[0.1em] text-white">
                          Real-time Email Sandbox Available
                        </div>
                        <div className="text-xs text-muted-foreground">
                          An actual Ethereal Test Account captured this email delivery. You can preview it in a live browser inbox.
                        </div>
                      </div>
                    </div>
                    <a
                      href={createdOrder.emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 border border-accent-red bg-accent-red hover:bg-transparent hover:text-accent-red transition-all px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Live Email
                    </a>
                  </div>
                )}

                {/* Simulated Email Client Interface */}
                <div className="border border-white/10 bg-[#09090b] overflow-hidden shadow-2xl">
                  {/* Email Client Header Bar */}
                  <div className="flex items-center gap-2 border-b border-white/10 bg-white/2 px-6 py-4">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-4 font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
                      Zowear Mail Client Simulator
                    </span>
                  </div>

                  {/* Mail Info Panel */}
                  <div className="border-b border-white/5 bg-[#0e0e11] px-8 py-6 space-y-2">
                    <div className="flex text-xs leading-normal">
                      <span className="w-16 text-zinc-500 font-bold uppercase tracking-wider">From:</span>
                      <span className="text-zinc-300">Zowears Collective &lt;orders@zowears.com&gt;</span>
                    </div>
                    <div className="flex text-xs leading-normal">
                      <span className="w-16 text-zinc-500 font-bold uppercase tracking-wider">To:</span>
                      <span className="text-zinc-300">{createdOrder.email}</span>
                    </div>
                    <div className="flex text-xs leading-normal">
                      <span className="w-16 text-zinc-500 font-bold uppercase tracking-wider">Subject:</span>
                      <span className="text-white font-bold">ZOWEARS COLLECTIVE - Order Confirmed #{createdOrder._id}</span>
                    </div>
                  </div>

                  {/* Email HTML Body Display */}
                  <div className="p-4 sm:p-8 bg-[#121214] max-h-[60vh] overflow-y-auto border-t border-white/5">
                    {createdOrder.emailHtml ? (
                      <div 
                        className="email-iframe-container bg-black border border-zinc-900 mx-auto rounded"
                        style={{ maxWidth: "600px" }}
                        dangerouslySetInnerHTML={{ __html: createdOrder.emailHtml }}
                      />
                    ) : (
                      <p className="text-center py-12 text-sm text-muted-foreground uppercase tracking-widest">
                        Email markup rendering error or unavailable.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-16">
            <Link 
              href="/shop"
              className="border border-white/20 px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] text-white transition-all hover:bg-white hover:text-black hover:border-white"
            >
              Return to Shop
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Render: EMPTY BAG ───────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-32 text-center md:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl uppercase">Checkout</h1>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
          Your silhouette bag is empty.
        </p>
        <Link 
          href="/shop" 
          className="mt-12 inline-block border border-foreground px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-foreground hover:text-background transition-colors"
        >
          Return to Collective
        </Link>
      </div>
    );
  }

  // ─── Render: CHECKOUT STEPS ──────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-24 md:px-8 md:pt-32">
      {/* Checkout Page Header */}
      <div className="mb-12 flex items-center justify-between border-b border-white/5 pb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Checkout</h1>
        <Link href="/cart" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to bag
        </Link>
      </div>

      <div className="grid gap-16 md:grid-cols-12">
        {/* Main Content Area: Steps & Form */}
        <div className="md:col-span-8">
          {/* Step Indicator Headers */}
          <div className="mb-16 flex flex-wrap items-center gap-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center border font-display text-sm transition-all ${i <= step ? "border-accent-red bg-accent-red text-white" : "border-white/10 text-muted-foreground"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className="ml-2 h-px w-12 bg-white/5" />}
              </div>
            ))}
          </div>

          {/* Form Step Display */}
          <div className="space-y-12">
            {/* Step 0: Address Details */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="grid gap-6 md:grid-cols-2">
                <Field 
                  label="Email Address" 
                  type="email" 
                  name="email"
                  wide 
                  placeholder="silhouette@zowears.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                />
                <Field 
                  label="First name" 
                  name="firstName"
                  placeholder="Hajime" 
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={errors.firstName}
                />
                <Field 
                  label="Last name" 
                  name="lastName"
                  placeholder="Saito" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={errors.lastName}
                />
                <Field 
                  label="Shipping Address" 
                  name="address"
                  wide 
                  placeholder="1-chome-2-3, Minato City" 
                  value={formData.address}
                  onChange={handleInputChange}
                  error={errors.address}
                />
                <Field 
                  label="City" 
                  name="city"
                  placeholder="Tokyo" 
                  value={formData.city}
                  onChange={handleInputChange}
                  error={errors.city}
                />
                <Field 
                  label="State / Province" 
                  name="state"
                  placeholder="Tokyo" 
                  value={formData.state}
                  onChange={handleInputChange}
                  error={errors.state}
                />
                <Field 
                  label="Pincode / Zip" 
                  name="zip"
                  placeholder="105-0011" 
                  value={formData.zip}
                  onChange={handleInputChange}
                  error={errors.zip}
                />
                <Field 
                  label="Phone" 
                  name="phone"
                  placeholder="+81 00-0000-0000" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                />
              </motion.div>
            )}

            {/* Step 1: Shipping Methods */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {[
                  { n: "Standard Shipping", d: "3–5 business days", p: standardShippingCost },
                  { n: "Express Shipping", d: "1–2 business days", p: 299 }
                ].map((o) => (
                  <label key={o.n} className="flex cursor-pointer items-center justify-between border border-white/5 bg-white/5 p-6 transition-all hover:border-white/20 has-[:checked]:border-accent-red">
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="ship" 
                        className="accent-accent-red h-4 w-4" 
                        checked={shippingMethod === (o.n.includes("Standard") ? "Standard" : "Express")} 
                        onChange={() => setShippingMethod(o.n.includes("Standard") ? "Standard" : "Express")}
                      />
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.2em]">{o.n}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{o.d}</div>
                      </div>
                    </div>
                    <div className="font-display text-lg">
                      {o.p === 0 ? "Complimentary" : formatPrice(o.p)}
                    </div>
                  </label>
                ))}
              </motion.div>
            )}

            {/* Step 2: Payment Choices */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {["Credit Card", "UPI / Digital Wallet", "Cash on delivery"].map((m, i) => (
                  <label key={m} className="flex cursor-pointer items-center gap-4 border border-white/5 bg-white/5 p-6 transition-all hover:border-white/20 has-[:checked]:border-accent-red">
                    <input 
                      type="radio" 
                      name="pay" 
                      className="accent-accent-red h-4 w-4" 
                      checked={paymentMethod === m} 
                      onChange={() => setPaymentMethod(m)}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{m}</span>
                  </label>
                ))}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-12">
              <button 
                onClick={() => setStep((s) => Math.max(0, s - 1))} 
                className="border border-white/10 px-10 py-5 text-[10px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-white/5 disabled:opacity-20" 
                disabled={step === 0 || isSubmitting}
              >
                Previous Step
              </button>
              
              {step === 2 ? (
                <button 
                  onClick={handleCompleteOrder}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 bg-foreground px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] text-background transition-all hover:bg-accent-red hover:text-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Securing Silhouette...
                    </>
                  ) : (
                    "Complete Order"
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleNextStep}
                  className="bg-foreground px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] text-background transition-all hover:bg-accent-red hover:text-white"
                >
                  Continue to {step === 0 ? "Shipping" : "Payment"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Checkout Bag Review */}
        <aside className="md:col-span-4">
          <div className="sticky top-32 bg-white/5 p-8 border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-red mb-8">Review Silhouette</div>
            <div className="max-h-[40vh] space-y-6 overflow-y-auto pr-4 no-scrollbar">
              {items.map((it, i) => {
                const p = resolve(it);
                if (!p) return null;
                return (
                  <div key={i} className="flex gap-4">
                    <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-background border border-white/5">
                      <Image src={p.image} alt={p.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">{p.name}</div>
                      <div className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{it.size} · {it.color} · ×{it.qty}</div>
                      <div className="font-display font-bold">{formatPrice(p.price * it.qty)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 space-y-4 border-t border-white/10 pt-8">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-accent-red">
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-[0.4em]">Total</span>
                <span className="font-display text-3xl font-bold text-accent-red">{formatPrice(subtotal + shippingCost)}</span>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secure Encrypted Checkout
              </div>
              <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                Artisanal Guarantee
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// Stateful Custom input field
function Field({ label, type = "text", name, wide, placeholder, value, onChange, error }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="block text-[9px] font-bold uppercase tracking-[0.3em] text-accent-red">{label}</span>
        {error && (
          <span className="text-[9px] font-bold text-accent-red/90 uppercase tracking-widest animate-pulse">
            {error}
          </span>
        )}
      </div>
      <input 
        type={type} 
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border bg-white/2 bg-transparent px-5 py-4 text-sm font-medium outline-none transition-colors placeholder:text-white/10 ${
          error ? "border-accent-red/50 focus:border-accent-red" : "border-white/5 focus:border-accent-red"
        }`} 
      />
    </label>
  );
}
