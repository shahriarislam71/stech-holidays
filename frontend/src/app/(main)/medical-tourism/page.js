"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FiCheck } from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const CONTACT_PHONE = "01321145910";

const COUNTRIES = [
  { key: "malaysia", name: "Malaysia", flag: "/medical-tourism/flags/malaysia.png" },
  { key: "india", name: "India", flag: "/medical-tourism/flags/india.png" },
  { key: "singapore", name: "Singapore", flag: "/medical-tourism/flags/singapore.png" },
  { key: "thailand", name: "Thailand", flag: "/medical-tourism/flags/thailand.png" },
  { key: "china", name: "China", flag: "/medical-tourism/flags/china.png" },
  { key: "turkey", name: "Turkey", flag: "/medical-tourism/flags/turkey.jpg" },
];

const SPECIALTIES = [
  "Cancer (Oncology)",
  "Heart Disease (Cardiology)",
  "Neurology",
  "Orthopedic & Spine",
  "Liver, Kidney & GI",
  "IVF & Infertility",
  "Health Screening",
  "Robotic Surgery",
];

const SERVICES = [
  "Doctor appointment scheduling",
  "Customized treatment plan",
  "Visa processing assistance",
  "Telemedicine & post-treatment follow-up",
  "Treatment plan & cost estimate",
  "Interpreter & transport service",
  "Air ticket & hotel booking assistance",
  "Airport pickup & drop",
  "Emergency medical & air ambulance",
  "24/7 support",
];

const COUNTRY_GROUPS = [
  {
    key: "malaysia",
    name: "Malaysia",
    banner: "/medical-tourism/hospitals/sunway-medical-centre.jpg",
    blurb:
      "Our featured priority partner — IPS is the official local representative of Sunway Medical Centre in Bangladesh.",
    hospitals: [
      {
        name: "Sunway Medical Centre",
        location: "Petaling Jaya, Malaysia",
        image: "/medical-tourism/hospitals/sunway-medical-centre.jpg",
        tags: ["Cancer", "Cardiology", "Orthopaedics", "IVF"],
        featured: true,
      },
    ],
  },
  {
    key: "india",
    name: "India",
    banner: "/medical-tourism/hospitals/apollo-proton-cancer-centre.jpg",
    blurb:
      "The most cost-effective destination for world-class treatment — advanced clinical outcomes at a fraction of Western prices, across our widest hospital network.",
    hospitals: [
      {
        name: "Apollo Main Hospital, Greams Lane",
        location: "Chennai, India",
        image: "/medical-tourism/hospitals/apollo-hospitals.jpg",
        tags: ["Cardiology", "Oncology (Proton Therapy)", "Neurosciences", "Organ Transplants"],
      },
      {
        name: "Apollo Proton Cancer Centre",
        location: "Chennai, India",
        image: "/medical-tourism/hospitals/apollo-proton-cancer-centre.jpg",
        tags: ["Oncology (Proton Beam Therapy)"],
      },
      {
        name: "Fortis Escorts Heart Institute",
        location: "Delhi, India",
        image: "/medical-tourism/hospitals/fortis-escorts-heart-institute.jpg",
        tags: ["Cardiology & Cardiac Surgery"],
      },
      {
        name: "Fortis Memorial Research Institute",
        location: "Gurgaon, India",
        image: "/medical-tourism/hospitals/fortis-memorial-research-institute.jpg",
        tags: ["Oncology (Medical, Surgical & Radiation)"],
      },
      {
        name: "Manipal Hospitals",
        location: "Bengaluru, India",
        image: "/medical-tourism/hospitals/manipal-bengaluru.webp",
        tags: ["Multi-speciality (Tertiary Care)"],
      },
      {
        name: "Manipal Hospitals",
        location: "Delhi, India",
        image: "/medical-tourism/hospitals/manipal-delhi.jpg",
        tags: ["Multi-speciality (Tertiary Care)"],
      },
      {
        name: "Manipal Hospitals",
        location: "Kolkata, India",
        image: "/medical-tourism/hospitals/manipal-kolkata.jpg",
        tags: ["Multi-speciality (Tertiary Care)"],
      },
    ],
  },
  {
    key: "singapore",
    name: "Singapore",
    banner: "/medical-tourism/hospitals/raffles-hospital-2.jpg",
    blurb:
      "The region's gold standard for precision and trust — Western-equivalent clinical rigour and English-language care in Southeast Asia's most advanced healthcare hub.",
    hospitals: [
      {
        name: "Raffles Hospital",
        location: "Singapore",
        image: "/medical-tourism/hospitals/raffles-hospital-2.jpg",
        tags: ["Cardiology", "Oncology", "Orthopaedics", "Fertility"],
      },
    ],
  },
  {
    key: "thailand",
    name: "Thailand",
    banner: "/medical-tourism/hospitals/bumrungrad.jpg",
    blurb:
      "A preferred destination for discerning international patients, renowned for precision diagnostics, comprehensive health screening, and strength in orthopaedics and oncology.",
    hospitals: [
      {
        name: "Bumrungrad International Hospital",
        location: "Bangkok, Thailand",
        image: "/medical-tourism/hospitals/bumrungrad.jpg",
        tags: ["Cardiology", "Oncology", "Orthopaedics", "Health Screening"],
      },
    ],
  },
  {
    key: "china",
    name: "China",
    banner: "/medical-tourism/hospitals/kunming-tongren.webp",
    blurb:
      "Combines traditional and modern medicine — a regional leader in oncology, bone marrow transplantation, spine surgery, and neonatal & paediatric care.",
    hospitals: [
      {
        name: "Fuda Cancer Hospital",
        location: "Guangzhou, China",
        image: "/medical-tourism/hospitals/fuda-cancer-hospital.webp",
        tags: ["Oncology", "Cryosurgery"],
      },
      {
        name: "Kunming Tongren Hospital",
        location: "Kunming, China",
        image: "/medical-tourism/hospitals/kunming-tongren.webp",
        tags: ["Cardiology", "Cardiothoracic & Vascular Surgery"],
      },
    ],
  },
  {
    key: "turkey",
    name: "Turkey",
    banner: "/medical-tourism/hospitals/memorial-ankara-night.jpeg",
    blurb:
      "World-renowned for organ transplantation — kidney, liver and bone marrow — alongside leading aesthetic medicine and fertility care.",
    hospitals: [
      {
        name: "Memorial Şişli Hospital",
        location: "Istanbul, Turkey",
        image: "/medical-tourism/hospitals/memorial-sisli.webp",
        tags: ["Cardiology & Cardiovascular Surgery", "Organ Transplant", "IVF"],
      },
      {
        name: "Memorial Ataşehir Hospital",
        location: "Istanbul, Turkey",
        image: "/medical-tourism/hospitals/memorial-atasehir.jpg",
        tags: ["Cardiology", "Organ Transplant", "Oncology", "IVF"],
      },
      {
        name: "Memorial Bahçelievler Hospital",
        location: "Istanbul, Turkey",
        image: "/medical-tourism/hospitals/memorial-bahcelievler.webp",
        tags: ["Cardiology", "Organ Transplant", "Oncology", "IVF"],
      },
      {
        name: "Memorial Ankara Hospital",
        location: "Ankara, Turkey",
        image: "/medical-tourism/hospitals/memorial-ankara-day.jpg",
        tags: ["Cardiology", "Organ Transplant", "Oncology", "IVF"],
      },
      {
        name: "Memorial Antalya Hospital",
        location: "Antalya, Turkey",
        image: "/medical-tourism/hospitals/memorial-antalya.webp",
        tags: ["IVF & Fertility (AAB-accredited)", "Organ Transplant", "Cardiology"],
      },
      {
        name: "Anadolu Medical Center",
        location: "Gebze, Turkey",
        image: "/medical-tourism/hospitals/anadolu-medical-center.jpg",
        tags: ["Oncology & Bone Marrow Transplant", "Cardiology", "Neurosurgery"],
      },
    ],
  },
];

const BEST_DESTINATION_BY_SPECIALTY = [
  { specialty: "Cancer / Oncology", countries: "India, China, Turkey, Malaysia" },
  { specialty: "Cardiology", countries: "India, China, Turkey, Singapore, Malaysia" },
  { specialty: "Organ transplant", countries: "Turkey, India" },
  { specialty: "Orthopaedics", countries: "India, Singapore, Thailand, Malaysia" },
  { specialty: "IVF & Fertility", countries: "Turkey, Singapore, Malaysia" },
  { specialty: "Health screening", countries: "Thailand, Singapore" },
];

const ADVANTAGES = [
  { title: "Doctor appointment", desc: "Access to leading specialists abroad, arranged before you travel." },
  { title: "Hospital admission", desc: "We manage admission so a new hospital feels less stressful." },
  { title: "Visa assistance", desc: "Help securing the hospital appointment letter and medical visa." },
  { title: "Ticketing", desc: "Air and bus tickets booked and timed around your treatment." },
  { title: "Ambulance support", desc: "Road and air ambulance available where medically required." },
  { title: "Hotel booking", desc: "Comfortable stays arranged close to your treating hospital." },
  { title: "Transparent pricing", desc: "Cost-effective treatment options with clear, upfront estimates." },
  { title: "Personalized care", desc: "Treatment plans tailored to your diagnosis, budget and timeline." },
  { title: "Peace of mind", desc: "One team manages medical and travel logistics end to end." },
];

const PROCESS_STEPS = [
  { title: "Inquiry", desc: "Share your medical reports and treatment needs with our team." },
  { title: "Medical report review", desc: "Partner hospitals review your case and confirm treatment feasibility." },
  { title: "Treatment plan & quote", desc: "Receive a clear treatment plan with transparent cost estimate." },
  { title: "Visa & travel arrangement", desc: "We handle visa processing, flights and hotel booking." },
  { title: "Treatment", desc: "Airport pickup, interpreter and on-ground support throughout." },
  { title: "Follow-up", desc: "Telemedicine follow-up once you're back home in Bangladesh." },
];

export default function MedicalTourismPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    country: "",
    treatment: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const visibleGroups = COUNTRY_GROUPS.filter(
    (group) => activeFilter === "all" || group.key === activeFilter
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) {
      toast.error("Please provide your name and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/medical-tourism/inquiry/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Request failed");

      toast.success("Thank you! Our team will call you back shortly.");
      setForm({ full_name: "", phone: "", email: "", country: "", treatment: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white">
      {/* Hero */}
      <div className="relative text-white py-16 md:py-24 overflow-hidden">
        <img
          src="/medical-tourism/hospitals/raffles-hospital-2.jpg"
          alt="Modern partner hospital abroad"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5A53A7]/95 via-[#5A53A7]/85 to-[#55C3A9]/80"></div>
        <div className="relative px-4 md:px-[190px]">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 rounded-full px-3 py-1 mb-5">
            Medical Tourism · Bangladesh to the World
          </span>
          <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight">
            Expert treatment abroad, arranged end-to-end from Dhaka
          </h1>
          <p className="mt-5 max-w-2xl text-white/90 text-lg">
            Stech Holidays connects Bangladeshi patients with leading hospitals across Malaysia, India,
            Singapore, Thailand, China and Turkey. One team manages your medical, visa and travel journey,
            start to finish.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#consult"
              className="rounded-xl bg-white text-[#5A53A7] font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all"
            >
              Request Free Consultation
            </a>
            <a
              href="#hospitals"
              className="rounded-xl border border-white/40 hover:bg-white/10 text-white font-semibold px-6 py-3 transition"
            >
              View Partner Hospitals
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 max-w-md gap-6 border-t border-white/20 pt-6">
            <div>
              <p className="text-2xl font-bold">6</p>
              <p className="text-xs text-white/80">Partner countries</p>
            </div>
            <div>
              <p className="text-2xl font-bold">18+</p>
              <p className="text-xs text-white/80">Partner hospitals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-xs text-white/80">Patient support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-[190px] py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Countries we serve */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">
              Our Global Reach
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Countries we serve</h2>
            <div className="flex flex-wrap gap-4">
              {COUNTRIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    setActiveFilter(c.key);
                    document.getElementById("hospitals")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-28 rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition text-left"
                >
                  <img src={c.flag} alt={`${c.name} flag`} className="h-16 w-full object-cover" />
                  <p className="text-center text-xs font-semibold text-gray-800 py-2">{c.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">
              Areas of Care
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Specialties we arrange treatment for
            </h2>
            <div className="flex flex-wrap gap-3">
              {SPECIALTIES.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 rounded-full bg-[#f2f1fa] border border-[#c8c3e9] text-[#3a3573] text-sm font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">
              What We Handle
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our services</h2>
            <p className="text-gray-500 max-w-2xl mb-6">
              Air and ground ambulance, visa assistance, travel packages, tickets, insurance and airport
              support — with full corporate and personal claim solutions.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-1">
              {SERVICES.map((s) => (
                <div key={s} className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#3fa190]">
                    <FiCheck />
                  </span>
                  <span className="text-sm text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Countries + hospitals */}
          <div id="hospitals" className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100 scroll-mt-24">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">
              Where You Can Be Treated
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Countries & partner hospitals
            </h2>
            <p className="text-gray-500 max-w-2xl mb-8">
              Our priority network across 6 countries. We can arrange care at other hospitals on request,
              but these are our trusted, highest-priority partners.
            </p>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  activeFilter === "all"
                    ? "bg-[#5A53A7] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#a79fda]"
                }`}
              >
                All Countries
              </button>
              {COUNTRIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveFilter(c.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
                    activeFilter === c.key
                      ? "bg-[#5A53A7] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#a79fda]"
                  }`}
                >
                  <img src={c.flag} className="h-3.5 w-5 object-cover rounded-sm" alt="" />
                  {c.name}
                </button>
              ))}
            </div>

            {visibleGroups.map((group) => (
              <div key={group.key} className="mb-14 last:mb-0">
                <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                  <img src={group.banner} alt={group.name} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#211e44]/90 via-[#211e44]/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={COUNTRIES.find((c) => c.key === group.key)?.flag}
                        alt={`${group.name} flag`}
                        className="h-5 w-8 object-cover rounded shadow"
                      />
                      <h3 className="text-white text-2xl font-bold">{group.name}</h3>
                    </div>
                    <p className="text-white/85 text-sm max-w-xl">{group.blurb}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.hospitals.map((h) => (
                    <article
                      key={h.name + h.location}
                      className={`bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition relative ${
                        h.featured ? "border-[#7ed4c1]" : "border-gray-200"
                      }`}
                    >
                      {h.featured && (
                        <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 bg-[#59beab] text-white text-[10px] font-bold uppercase tracking-wide rounded-full px-3 py-1 shadow">
                          Local Representative
                        </span>
                      )}
                      <div className="relative">
                        <img src={h.image} alt={h.name} className="h-44 w-full object-cover" />
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 rounded-full pl-1 pr-3 py-1 text-xs font-semibold text-gray-800 shadow">
                          <img
                            src={COUNTRIES.find((c) => c.key === group.key)?.flag}
                            className="h-3.5 w-5 object-cover rounded-sm"
                            alt=""
                          />
                          {group.name}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900">{h.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 mb-3">{h.location}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {h.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] font-medium bg-[#eefaf7] text-[#28675f] rounded px-2 py-0.5"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Best destination by specialty */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">
              Quick Reference
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Best destination by specialty
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-10">
              {BEST_DESTINATION_BY_SPECIALTY.map((row) => (
                <div
                  key={row.specialty}
                  className="flex justify-between py-3 border-b border-dotted border-gray-300"
                >
                  <span className="font-semibold text-gray-800 text-sm">{row.specialty}</span>
                  <span className="text-sm text-gray-500 text-right">{row.countries}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Advantage */}
          <div className="bg-gradient-to-br from-[#5A53A7] to-[#55C3A9] text-white rounded-2xl shadow-lg p-8 md:p-10 mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/80 mb-1">
              The Stech Advantage
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Why patients choose us</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADVANTAGES.map((a) => (
                <div key={a.title} className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                  <h3 className="font-semibold mb-1">{a.title}</h3>
                  <p className="text-sm text-white/85">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How we work */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">Process</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">How we work</h2>
            <ol className="space-y-6">
              {PROCESS_STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="text-2xl font-bold text-[#55C3A9] w-10 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Contact form */}
          <div id="consult" className="scroll-mt-24 bg-gradient-to-br from-[#f2f1fa] to-[#eefaf7] rounded-2xl border border-gray-100 p-8 md:p-12">
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-2">
                Free Consultation
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Tell us what you need — we&apos;ll call you back
              </h2>
              <p className="text-gray-500 mt-3">
                Get a treatment plan and cost estimate from our partner hospitals, at no cost.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-5 max-w-3xl mx-auto"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a79fda] focus:border-[#847ac8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+880"
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a79fda] focus:border-[#847ac8]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email (optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a79fda] focus:border-[#847ac8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country of interest</label>
                  <select
                    name="country"
                    required
                    value={form.country}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a79fda] focus:border-[#847ac8]"
                  >
                    <option value="" disabled>
                      Select a country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.key} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Treatment needed</label>
                <input
                  type="text"
                  name="treatment"
                  value={form.treatment}
                  onChange={handleChange}
                  placeholder="e.g. Cardiac surgery, IVF, cancer treatment"
                  className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a79fda] focus:border-[#847ac8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message / details</label>
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us a bit about your case"
                  className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#a79fda] focus:border-[#847ac8]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-gradient-to-r from-[#5A53A7] to-[#55C3A9] hover:opacity-90 text-white font-semibold py-3.5 transition disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Request Free Consultation"}
              </button>
              <p className="text-center text-xs text-gray-400">
                Or call us directly at{" "}
                <a href={`tel:+880${CONTACT_PHONE.slice(1)}`} className="text-[#5A53A7] font-medium">
                  {CONTACT_PHONE}
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
