import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import HalftoneDecor from "./HalftoneDecor";
import CyberDecor from "./CyberDecor";

function LetterGlowHeading({ text }) {
  let letterIndex = 0;
  const words = text.split(/\s+/);

  return (
    <motion.h2
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
      className="contact-letter-heading font-heading font-black uppercase tracking-tight text-white"
      aria-label={text}
    >
      {words.map((word, wordIndex) => (
        <span className="contact-word" key={`${word}-${wordIndex}`}>
          {Array.from(word).map((letter) => {
            const index = letterIndex++;
            return (
              <span
                key={`${letter}-${index}`}
                aria-hidden="true"
                className="contact-letter"
                style={{ "--letter-index": index }}
              >
                {letter}
              </span>
            );
          })}
        </span>
      ))}
    </motion.h2>
  );
}


export default function Contact() {
  const { content: siteContent, ui } = useLanguage();
  const { contact, emailjs: ejs } = siteContent;
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    website: "",
  }); // website = honeypot
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [errors, setErrors] = useState({});
  const sectionRef = useRef(null);
  const isVisible = useInView(sectionRef, { amount: 0.08, margin: "160px 0px" });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = ui.validationName;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = ui.validationEmail;
    if (form.message.trim().length < 10) e.message = ui.validationMessage;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.website) return; // honeypot filled — silent drop
    if (!validate()) return;
    setState("loading");
    try {
      const configured =
        ejs.serviceId &&
        !ejs.serviceId.startsWith("INSERT_") &&
        ejs.templateId &&
        !ejs.templateId.startsWith("INSERT_") &&
        ejs.publicKey &&
        !ejs.publicKey.startsWith("INSERT_");

      if (configured) {
        await emailjs.send(
          ejs.serviceId,
          ejs.templateId,
          {
            from_name: form.name,
            from_email: form.email,
            message: form.message,
          },
          { publicKey: ejs.publicKey },
        );
      } else {
        // Placeholder mode — simulate a successful send for demo purposes.
        await new Promise((r) => setTimeout(r, 900));
      }
      setState("success");
      toast.success(ui.successToast);
      setForm({ name: "", email: "", message: "", website: "" });
      setTimeout(() => setState("idle"), 3000);
    } catch (err) {
      console.error(err);
      setState("error");
      toast.error(ui.errorToast);
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const input =
    "contact-input w-full bg-transparent border-b border-white/15 py-4 font-body text-base text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-white focus:[box-shadow:0_1px_0_0_rgba(255,255,255,0.6),0_0_24px_-6px_rgba(255,255,255,0.4)]";

  return (
    <section
      ref={sectionRef}
      id="contact"
      data-testid="section-contact"
      className={`relative overflow-hidden border-t border-white/5 py-24 md:py-40 ${isVisible ? "viewport-active" : "viewport-paused"}`}
    >
      <HalftoneDecor variant="contact" intensity="soft" />
      <CyberDecor variant="contact" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-14 flex items-end justify-between">
          <span className="font-mono-label text-[11px] text-white/40">
            {contact.label}
          </span>
          <span className="font-mono-label text-[11px] text-white/40">
            {ui.sayHi}
          </span>
        </div>

        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <LetterGlowHeading text={contact.heading} />
            <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/60 md:text-lg">
              {contact.intro}
            </p>

            <ul className="mt-10 space-y-4 border-t border-white/10 pt-6 text-white/80">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-white/50" />
                <a
                  data-testid="contact-email-link"
                  href={`mailto:${contact.email}`}
                  className="glow-hover font-body text-sm hover:text-white"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-white/50" />
                <span className="font-body text-sm">
                  {contact.location} · {contact.availability}
                </span>
              </li>
            </ul>
          </div>

          <motion.form
            data-testid="contact-form"
            onSubmit={handleSubmit}
            className="col-span-12 md:col-span-6 lg:col-span-7"
            noValidate
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
          >
            <div
              className="contact-form-glow contact-form-panel relative rounded-2xl border border-white/12 p-6 md:p-10"
              style={{
                boxShadow:
                  "inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 0 60px rgba(255,255,255,0.03), 0 40px 80px -40px rgba(0,0,0,0.6)",
              }}
            >
              <span className="pointer-events-none absolute right-4 top-4 font-mono-label text-[10px] text-white/25">
                + FORM
              </span>
              {/* Honeypot */}
              <input
                type="text"
                name="website"
                autoComplete="off"
                tabIndex={-1}
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="hidden"
                aria-hidden
              />

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block font-mono-label text-[10px] text-white/40"
                    htmlFor="name"
                  >
                    {ui.name}
                  </label>
                  <input
                    id="name"
                    data-testid="contact-name"
                    className={input}
                    placeholder={ui.namePlaceholder}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && (
                    <p className="mt-2 font-mono-label text-[10px] text-red-300">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    className="mb-2 block font-mono-label text-[10px] text-white/40"
                    htmlFor="email"
                  >
                    {ui.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    data-testid="contact-email"
                    className={input}
                    placeholder={ui.emailPlaceholder}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <p className="mt-2 font-mono-label text-[10px] text-red-300">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <label
                  className="mb-2 block font-mono-label text-[10px] text-white/40"
                  htmlFor="message"
                >
                  {ui.message}
                </label>
                <textarea
                  id="message"
                  data-testid="contact-message"
                  rows={5}
                  className={`${input} resize-none`}
                  placeholder={ui.messagePlaceholder}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
                {errors.message && (
                  <p className="mt-2 font-mono-label text-[10px] text-red-300">
                    {errors.message}
                  </p>
                )}
              </div>

              <motion.button
                data-testid="contact-submit"
                type="submit"
                disabled={state === "loading"}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.7, 0, 0.2, 1] }}
                className="glow-hover mt-10 inline-flex items-center gap-3 rounded-full border border-white bg-white px-8 py-4 font-mono-label text-[11px] text-black transition-all disabled:opacity-60"
              >
                {state === "loading" ? (
                  <>
                    {ui.sending} <Loader2 size={14} className="animate-spin" />
                  </>
                ) : state === "success" ? (
                  <>{ui.sent}</>
                ) : (
                  <>
                    {ui.sendMessage} <Send size={14} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
