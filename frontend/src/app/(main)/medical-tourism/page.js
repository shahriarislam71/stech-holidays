"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FiCheck } from "react-icons/fi";
import { Pencil, Save, X, Plus, Trash2, Upload } from "lucide-react";
import useEditableComponent from "@/hooks/useEditableComponent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK_DATA = {
  hero: {
    badge: "Medical Tourism · Bangladesh to the World",
    title: "Expert treatment abroad, arranged end-to-end from Dhaka",
    description:
      "Stech Holidays connects Bangladeshi patients with leading hospitals across Malaysia, India, Singapore, Thailand, China and Turkey. One team manages your medical, visa and travel journey, start to finish.",
    primaryButtonText: "Request Free Consultation",
    secondaryButtonText: "View Partner Hospitals",
    backgroundImage: "/medical-tourism/hospitals/raffles-hospital-2.jpg",
    stats: [
      { value: "6", label: "Partner countries" },
      { value: "18+", label: "Partner hospitals" },
      { value: "24/7", label: "Patient support" },
    ],
    contactPhone: "01321145910",
  },
  ipsBd: {
    eyebrow: "A Sister Concern of Stech Holidays",
    title: "International Patient Service BD",
    description:
      "International Patient Service BD (IPS BD) is the dedicated medical tourism wing of Stech Holidays, focused solely on guiding Bangladeshi patients through treatment abroad — from hospital selection and appointment scheduling to visa support and on-ground assistance overseas.",
    services: [
      "Hospital & specialist matching",
      "Treatment cost estimates",
      "Medical visa assistance",
      "Travel & accommodation support",
      "Airport pickup & local escort abroad",
      "Post-treatment follow-up",
    ],
    facebookUrl: "https://www.facebook.com/share/1BDAQBJeqm",
  },
  countries: [
    { key: "malaysia", name: "Malaysia", flag: "/medical-tourism/flags/malaysia.png" },
    { key: "india", name: "India", flag: "/medical-tourism/flags/india.png" },
    { key: "singapore", name: "Singapore", flag: "/medical-tourism/flags/singapore.png" },
    { key: "thailand", name: "Thailand", flag: "/medical-tourism/flags/thailand.png" },
    { key: "china", name: "China", flag: "/medical-tourism/flags/china.png" },
    { key: "turkey", name: "Turkey", flag: "/medical-tourism/flags/turkey.jpg" },
  ],
  specialties: [
    "Cancer (Oncology)",
    "Heart Disease (Cardiology)",
    "Neurology",
    "Orthopedic & Spine",
    "Liver, Kidney & GI",
    "IVF & Infertility",
    "Health Screening",
    "Robotic Surgery",
  ],
  servicesSection: {
    description:
      "Air and ground ambulance, visa assistance, travel packages, tickets, insurance and airport support — with full corporate and personal claim solutions.",
    items: [
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
    ],
  },
  countryGroups: [
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
  ],
  bestDestinations: [
    { specialty: "Cancer / Oncology", countries: "India, China, Turkey, Malaysia" },
    { specialty: "Cardiology", countries: "India, China, Turkey, Singapore, Malaysia" },
    { specialty: "Organ transplant", countries: "Turkey, India" },
    { specialty: "Orthopaedics", countries: "India, Singapore, Thailand, Malaysia" },
    { specialty: "IVF & Fertility", countries: "Turkey, Singapore, Malaysia" },
    { specialty: "Health screening", countries: "Thailand, Singapore" },
  ],
  advantages: [
    { title: "Doctor appointment", desc: "Access to leading specialists abroad, arranged before you travel." },
    { title: "Hospital admission", desc: "We manage admission so a new hospital feels less stressful." },
    { title: "Visa assistance", desc: "Help securing the hospital appointment letter and medical visa." },
    { title: "Ticketing", desc: "Air and bus tickets booked and timed around your treatment." },
    { title: "Ambulance support", desc: "Road and air ambulance available where medically required." },
    { title: "Hotel booking", desc: "Comfortable stays arranged close to your treating hospital." },
    { title: "Transparent pricing", desc: "Cost-effective treatment options with clear, upfront estimates." },
    { title: "Personalized care", desc: "Treatment plans tailored to your diagnosis, budget and timeline." },
    { title: "Peace of mind", desc: "One team manages medical and travel logistics end to end." },
  ],
  processSteps: [
    { title: "Inquiry", desc: "Share your medical reports and treatment needs with our team." },
    { title: "Medical report review", desc: "Partner hospitals review your case and confirm treatment feasibility." },
    { title: "Treatment plan & quote", desc: "Receive a clear treatment plan with transparent cost estimate." },
    { title: "Visa & travel arrangement", desc: "We handle visa processing, flights and hotel booking." },
    { title: "Treatment", desc: "Airport pickup, interpreter and on-ground support throughout." },
    { title: "Follow-up", desc: "Telemedicine follow-up once you're back home in Bangladesh." },
  ],
};

// Small reusable edit-mode field helpers (inline text/textarea inputs
// styled to sit inside light or dark section backgrounds).
const EditText = ({ value, onChange, className = "", dark = false }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`rounded px-2 py-1 w-full ${dark ? "bg-white/90 text-[#2b2860]" : "bg-[#f2f1fa] text-[#2b2860]"} ${className}`}
  />
);

const EditTextarea = ({ value, onChange, rows = 3, className = "", dark = false }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className={`rounded px-2 py-1 w-full ${dark ? "bg-white/90 text-[#2b2860]" : "bg-[#f2f1fa] text-[#2b2860]"} ${className}`}
  />
);

export default function MedicalTourismPage() {
  const {
    data,
    tempData,
    setTempData,
    isAdmin,
    editMode,
    startEdit,
    cancelEdit,
    save,
    saving,
    uploadImage,
  } = useEditableComponent("medical-tourism-page", FALLBACK_DATA);

  const view = editMode ? tempData : data;

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

  const visibleGroups = view.countryGroups.filter(
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

  // ---- generic editor helpers (operate on tempData) ----
  const setPath = (updater) => setTempData((prev) => updater({ ...prev }));

  const updateHero = (field, value) =>
    setPath((d) => ({ ...d, hero: { ...d.hero, [field]: value } }));

  const updateHeroStat = (index, field, value) =>
    setPath((d) => {
      const stats = [...d.hero.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...d, hero: { ...d.hero, stats } };
    });

  const updateIpsBd = (field, value) =>
    setPath((d) => ({ ...d, ipsBd: { ...d.ipsBd, [field]: value } }));

  const updateIpsBdService = (index, value) =>
    setPath((d) => {
      const services = [...d.ipsBd.services];
      services[index] = value;
      return { ...d, ipsBd: { ...d.ipsBd, services } };
    });

  const addIpsBdService = () =>
    setPath((d) => ({ ...d, ipsBd: { ...d.ipsBd, services: [...d.ipsBd.services, "New service"] } }));

  const removeIpsBdService = (index) =>
    setPath((d) => ({
      ...d,
      ipsBd: { ...d.ipsBd, services: d.ipsBd.services.filter((_, i) => i !== index) },
    }));

  const updateCountry = (index, field, value) =>
    setPath((d) => {
      const countries = [...d.countries];
      countries[index] = { ...countries[index], [field]: value };
      return { ...d, countries };
    });

  const addCountry = () =>
    setPath((d) => ({
      ...d,
      countries: [...d.countries, { key: `country-${Date.now()}`, name: "New Country", flag: "" }],
    }));

  const removeCountry = (index) =>
    setPath((d) => ({ ...d, countries: d.countries.filter((_, i) => i !== index) }));

  const updateSpecialty = (index, value) =>
    setPath((d) => {
      const specialties = [...d.specialties];
      specialties[index] = value;
      return { ...d, specialties };
    });

  const addSpecialty = () => setPath((d) => ({ ...d, specialties: [...d.specialties, "New specialty"] }));

  const removeSpecialty = (index) =>
    setPath((d) => ({ ...d, specialties: d.specialties.filter((_, i) => i !== index) }));

  const updateServiceItem = (index, value) =>
    setPath((d) => {
      const items = [...d.servicesSection.items];
      items[index] = value;
      return { ...d, servicesSection: { ...d.servicesSection, items } };
    });

  const addServiceItem = () =>
    setPath((d) => ({
      ...d,
      servicesSection: { ...d.servicesSection, items: [...d.servicesSection.items, "New service"] },
    }));

  const removeServiceItem = (index) =>
    setPath((d) => ({
      ...d,
      servicesSection: {
        ...d.servicesSection,
        items: d.servicesSection.items.filter((_, i) => i !== index),
      },
    }));

  const updateGroup = (groupIndex, field, value) =>
    setPath((d) => {
      const groups = [...d.countryGroups];
      groups[groupIndex] = { ...groups[groupIndex], [field]: value };
      return { ...d, countryGroups: groups };
    });

  const addGroup = () =>
    setPath((d) => ({
      ...d,
      countryGroups: [
        ...d.countryGroups,
        { key: `group-${Date.now()}`, name: "New Country", banner: "", blurb: "", hospitals: [] },
      ],
    }));

  const removeGroup = (groupIndex) =>
    setPath((d) => ({ ...d, countryGroups: d.countryGroups.filter((_, i) => i !== groupIndex) }));

  const updateHospital = (groupIndex, hospitalIndex, field, value) =>
    setPath((d) => {
      const groups = [...d.countryGroups];
      const hospitals = [...groups[groupIndex].hospitals];
      hospitals[hospitalIndex] = { ...hospitals[hospitalIndex], [field]: value };
      groups[groupIndex] = { ...groups[groupIndex], hospitals };
      return { ...d, countryGroups: groups };
    });

  const addHospital = (groupIndex) =>
    setPath((d) => {
      const groups = [...d.countryGroups];
      groups[groupIndex] = {
        ...groups[groupIndex],
        hospitals: [
          ...groups[groupIndex].hospitals,
          { name: "New Hospital", location: "", image: "", tags: [] },
        ],
      };
      return { ...d, countryGroups: groups };
    });

  const removeHospital = (groupIndex, hospitalIndex) =>
    setPath((d) => {
      const groups = [...d.countryGroups];
      groups[groupIndex] = {
        ...groups[groupIndex],
        hospitals: groups[groupIndex].hospitals.filter((_, i) => i !== hospitalIndex),
      };
      return { ...d, countryGroups: groups };
    });

  const updateBestDestination = (index, field, value) =>
    setPath((d) => {
      const rows = [...d.bestDestinations];
      rows[index] = { ...rows[index], [field]: value };
      return { ...d, bestDestinations: rows };
    });

  const addBestDestination = () =>
    setPath((d) => ({
      ...d,
      bestDestinations: [...d.bestDestinations, { specialty: "New specialty", countries: "" }],
    }));

  const removeBestDestination = (index) =>
    setPath((d) => ({ ...d, bestDestinations: d.bestDestinations.filter((_, i) => i !== index) }));

  const updateAdvantage = (index, field, value) =>
    setPath((d) => {
      const list = [...d.advantages];
      list[index] = { ...list[index], [field]: value };
      return { ...d, advantages: list };
    });

  const addAdvantage = () =>
    setPath((d) => ({ ...d, advantages: [...d.advantages, { title: "New advantage", desc: "" }] }));

  const removeAdvantage = (index) =>
    setPath((d) => ({ ...d, advantages: d.advantages.filter((_, i) => i !== index) }));

  const updateProcessStep = (index, field, value) =>
    setPath((d) => {
      const list = [...d.processSteps];
      list[index] = { ...list[index], [field]: value };
      return { ...d, processSteps: list };
    });

  const addProcessStep = () =>
    setPath((d) => ({ ...d, processSteps: [...d.processSteps, { title: "New step", desc: "" }] }));

  const removeProcessStep = (index) =>
    setPath((d) => ({ ...d, processSteps: d.processSteps.filter((_, i) => i !== index) }));

  const handleImageUpload = async (file, onDone, category) => {
    const url = await uploadImage(file, category);
    if (url) onDone(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7ff] to-white relative">
      {isAdmin && (
        <div className="fixed top-24 right-4 z-50 flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg disabled:opacity-60"
                title="Save changes"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={cancelEdit}
                className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="bg-white text-[#5A53A7] p-3 rounded-full shadow-lg hover:bg-gray-100"
              title="Edit this page"
            >
              <Pencil className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Hero */}
      <div className="relative text-white py-16 md:py-24 overflow-hidden">
        <img
          src={view.hero.backgroundImage}
          alt="Modern partner hospital abroad"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#5A53A7]/95 via-[#5A53A7]/85 to-[#55C3A9]/80"></div>
        {editMode && (
          <label className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 bg-white text-[#5A53A7] text-xs font-semibold px-3 py-2 rounded-full shadow cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Change background
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleImageUpload(file, (url) => updateHero("backgroundImage", url), "medical-tourism-hero");
              }}
            />
          </label>
        )}
        <div className="relative px-4 md:px-8 lg:px-16 xl:px-32">
          {editMode ? (
            <EditText value={view.hero.badge} onChange={(v) => updateHero("badge", v)} className="max-w-md mb-5 text-xs" dark />
          ) : (
            <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-white/15 rounded-full px-3 py-1 mb-5">
              {view.hero.badge}
            </span>
          )}

          {editMode ? (
            <EditTextarea value={view.hero.title} onChange={(v) => updateHero("title", v)} rows={2} className="max-w-2xl text-2xl font-bold mb-3" dark />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold max-w-2xl leading-tight">{view.hero.title}</h1>
          )}

          {editMode ? (
            <EditTextarea value={view.hero.description} onChange={(v) => updateHero("description", v)} rows={3} className="max-w-2xl mt-5" dark />
          ) : (
            <p className="mt-5 max-w-2xl text-white/90 text-lg">{view.hero.description}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            {editMode ? (
              <>
                <EditText value={view.hero.primaryButtonText} onChange={(v) => updateHero("primaryButtonText", v)} className="max-w-xs" dark />
                <EditText value={view.hero.secondaryButtonText} onChange={(v) => updateHero("secondaryButtonText", v)} className="max-w-xs" dark />
              </>
            ) : (
              <>
                <a
                  href="#consult"
                  className="rounded-xl bg-white text-[#5A53A7] font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all"
                >
                  {view.hero.primaryButtonText}
                </a>
                <a
                  href="#hospitals"
                  className="rounded-xl border border-white/40 hover:bg-white/10 text-white font-semibold px-6 py-3 transition"
                >
                  {view.hero.secondaryButtonText}
                </a>
              </>
            )}
          </div>

          <div className="mt-12 grid grid-cols-3 max-w-md gap-6 border-t border-white/20 pt-6">
            {view.hero.stats.map((stat, index) => (
              <div key={index}>
                {editMode ? (
                  <>
                    <EditText value={stat.value} onChange={(v) => updateHeroStat(index, "value", v)} className="text-lg font-bold mb-1" dark />
                    <EditText value={stat.label} onChange={(v) => updateHeroStat(index, "label", v)} className="text-xs" dark />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-white/80">{stat.label}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-16 xl:px-32 py-12 md:py-16">
        <div className="max-w-[1600px] mx-auto">
          {/* International Patient Service BD - sister concern */}
          <div className="bg-gradient-to-br from-[#5A53A7] to-[#55C3A9] rounded-2xl shadow-lg p-8 md:p-10 mb-12 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              <div className="flex-1">
                {editMode ? (
                  <EditText value={view.ipsBd.eyebrow} onChange={(v) => updateIpsBd("eyebrow", v)} className="max-w-md mb-1 text-xs" dark />
                ) : (
                  <p className="text-xs font-semibold tracking-widest uppercase text-white/80 mb-1">{view.ipsBd.eyebrow}</p>
                )}

                {editMode ? (
                  <EditText value={view.ipsBd.title} onChange={(v) => updateIpsBd("title", v)} className="max-w-md mb-4 text-xl font-bold" dark />
                ) : (
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{view.ipsBd.title}</h2>
                )}

                {editMode ? (
                  <EditTextarea value={view.ipsBd.description} onChange={(v) => updateIpsBd("description", v)} rows={4} className="max-w-2xl mb-4" dark />
                ) : (
                  <p className="text-white/90 max-w-2xl mb-4">{view.ipsBd.description}</p>
                )}

                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/90 mb-6">
                  {view.ipsBd.services.map((service, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {editMode ? (
                        <>
                          <EditText value={service} onChange={(v) => updateIpsBdService(index, v)} className="text-sm" dark />
                          <button onClick={() => removeIpsBdService(index)} className="text-red-200 shrink-0" title="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <FiCheck className="shrink-0" /> {service}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                {editMode && (
                  <button
                    onClick={addIpsBdService}
                    className="flex items-center gap-1 text-xs text-white/90 border border-white/40 rounded-full px-3 py-1 hover:bg-white/10 mb-6"
                  >
                    <Plus className="w-3 h-3" /> Add service
                  </button>
                )}

                <div className="flex flex-wrap gap-3 items-center">
                  {editMode ? (
                    <EditText value={view.ipsBd.facebookUrl} onChange={(v) => updateIpsBd("facebookUrl", v)} className="max-w-sm text-sm" dark />
                  ) : (
                    <a
                      href={view.ipsBd.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-white text-[#5A53A7] font-semibold px-5 py-2.5 shadow-lg hover:shadow-xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                      Follow on Facebook
                    </a>
                  )}
                  {!editMode && (
                    <a
                      href="#consult"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/40 hover:bg-white/10 font-semibold px-5 py-2.5 transition"
                    >
                      Talk to IPS BD
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Countries we serve */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">Our Global Reach</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Countries we serve</h2>
            <div className="flex flex-wrap gap-4">
              {view.countries.map((c, index) => (
                <div key={c.key || index} className="relative w-28">
                  {editMode ? (
                    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden p-2 space-y-1">
                      <div className="relative">
                        <img src={c.flag} alt={`${c.name} flag`} className="h-16 w-full object-cover rounded" />
                        <label className="absolute bottom-1 right-1 bg-[#5A53A7] text-white rounded-full p-1 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(file, (url) => updateCountry(index, "flag", url), "medical-tourism-flag");
                            }}
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateCountry(index, "name", e.target.value)}
                        className="text-center text-xs font-semibold text-gray-800 w-full bg-[#f2f1fa] rounded"
                      />
                      <button
                        onClick={() => removeCountry(index)}
                        className="w-full text-red-500 flex items-center justify-center gap-1 text-xs"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveFilter(c.key);
                        document.getElementById("hospitals")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-28 rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition text-left"
                    >
                      <img src={c.flag} alt={`${c.name} flag`} className="h-16 w-full object-cover" />
                      <p className="text-center text-xs font-semibold text-gray-800 py-2">{c.name}</p>
                    </button>
                  )}
                </div>
              ))}
              {editMode && (
                <button
                  onClick={addCountry}
                  className="w-28 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs mt-1">Add country</span>
                </button>
              )}
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">Areas of Care</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Specialties we arrange treatment for</h2>
            <div className="flex flex-wrap gap-3">
              {view.specialties.map((s, index) => (
                <div key={index} className="flex items-center gap-1">
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={s}
                        onChange={(e) => updateSpecialty(index, e.target.value)}
                        className="px-3 py-2 rounded-full bg-[#f2f1fa] border border-[#c8c3e9] text-[#3a3573] text-sm font-medium"
                      />
                      <button onClick={() => removeSpecialty(index)} className="text-red-500" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="px-4 py-2 rounded-full bg-[#f2f1fa] border border-[#c8c3e9] text-[#3a3573] text-sm font-medium">
                      {s}
                    </span>
                  )}
                </div>
              ))}
              {editMode && (
                <button
                  onClick={addSpecialty}
                  className="px-4 py-2 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add specialty
                </button>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">What We Handle</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Our services</h2>
            {editMode ? (
              <EditTextarea
                value={view.servicesSection.description}
                onChange={(v) => setPath((d) => ({ ...d, servicesSection: { ...d.servicesSection, description: v } }))}
                rows={2}
                className="max-w-2xl mb-6"
              />
            ) : (
              <p className="text-gray-500 max-w-2xl mb-6">{view.servicesSection.description}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-1">
              {view.servicesSection.items.map((s, index) => (
                <div key={index} className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e9f8f4] text-[#3fa190]">
                    <FiCheck />
                  </span>
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={s}
                        onChange={(e) => updateServiceItem(index, e.target.value)}
                        className="text-sm text-gray-700 bg-[#f2f1fa] rounded px-2 py-1 flex-1"
                      />
                      <button onClick={() => removeServiceItem(index)} className="text-red-500 shrink-0" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-700">{s}</span>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <button
                onClick={addServiceItem}
                className="mt-4 flex items-center gap-1 text-xs text-gray-500 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add service
              </button>
            )}
          </div>

          {/* Countries + hospitals */}
          <div id="hospitals" className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100 scroll-mt-24">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">Where You Can Be Treated</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Countries & partner hospitals</h2>
            <p className="text-gray-500 max-w-2xl mb-8">
              Our priority network across {view.countries.length} countries. We can arrange care at other hospitals on
              request, but these are our trusted, highest-priority partners.
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
              {view.countries.map((c) => (
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

            {view.countryGroups.map((group, groupIndex) => {
              if (!editMode && activeFilter !== "all" && group.key !== activeFilter) return null;
              return (
                <div key={group.key || groupIndex} className="mb-14 last:mb-0">
                  <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                    <img src={group.banner} alt={group.name} className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#211e44]/90 via-[#211e44]/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      {editMode ? (
                        <div className="space-y-2 max-w-xl">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateGroup(groupIndex, "name", e.target.value)}
                            className="text-lg font-bold bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full"
                          />
                          <textarea
                            value={group.blurb}
                            onChange={(e) => updateGroup(groupIndex, "blurb", e.target.value)}
                            rows={2}
                            className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full"
                          />
                          <div className="flex gap-2">
                            <label className="inline-flex items-center gap-1 bg-white text-[#5A53A7] text-xs font-semibold px-3 py-1.5 rounded-full shadow cursor-pointer">
                              <Upload className="w-3 h-3" /> Change banner
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) handleImageUpload(file, (url) => updateGroup(groupIndex, "banner", url), "medical-tourism-banner");
                                }}
                              />
                            </label>
                            <button
                              onClick={() => removeGroup(groupIndex)}
                              className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow"
                            >
                              <Trash2 className="w-3 h-3" /> Remove country
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={view.countries.find((c) => c.key === group.key)?.flag}
                              alt={`${group.name} flag`}
                              className="h-5 w-8 object-cover rounded shadow"
                            />
                            <h3 className="text-white text-2xl font-bold">{group.name}</h3>
                          </div>
                          <p className="text-white/85 text-sm max-w-xl">{group.blurb}</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.hospitals.map((h, hospitalIndex) => (
                      <article
                        key={hospitalIndex}
                        className={`bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition relative ${
                          h.featured ? "border-[#7ed4c1]" : "border-gray-200"
                        }`}
                      >
                        {h.featured && !editMode && (
                          <span className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 bg-[#59beab] text-white text-[10px] font-bold uppercase tracking-wide rounded-full px-3 py-1 shadow">
                            Local Representative
                          </span>
                        )}
                        <div className="relative">
                          <img src={h.image} alt={h.name} className="h-44 w-full object-cover" />
                          {editMode ? (
                            <label className="absolute bottom-2 right-2 bg-[#5A53A7] text-white rounded-full p-1.5 cursor-pointer">
                              <Upload className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file)
                                    handleImageUpload(
                                      file,
                                      (url) => updateHospital(groupIndex, hospitalIndex, "image", url),
                                      "medical-tourism-hospital"
                                    );
                                }}
                              />
                            </label>
                          ) : (
                            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 rounded-full pl-1 pr-3 py-1 text-xs font-semibold text-gray-800 shadow">
                              <img
                                src={view.countries.find((c) => c.key === group.key)?.flag}
                                className="h-3.5 w-5 object-cover rounded-sm"
                                alt=""
                              />
                              {group.name}
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          {editMode ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={h.name}
                                onChange={(e) => updateHospital(groupIndex, hospitalIndex, "name", e.target.value)}
                                className="font-bold text-gray-900 bg-[#f2f1fa] rounded px-2 py-1 w-full"
                              />
                              <input
                                type="text"
                                value={h.location}
                                onChange={(e) => updateHospital(groupIndex, hospitalIndex, "location", e.target.value)}
                                className="text-xs text-gray-500 bg-[#f2f1fa] rounded px-2 py-1 w-full"
                              />
                              <input
                                type="text"
                                value={(h.tags || []).join(", ")}
                                onChange={(e) =>
                                  updateHospital(
                                    groupIndex,
                                    hospitalIndex,
                                    "tags",
                                    e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                                  )
                                }
                                placeholder="Tags, comma separated"
                                className="text-xs text-gray-500 bg-[#f2f1fa] rounded px-2 py-1 w-full"
                              />
                              <label className="flex items-center gap-1.5 text-xs text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={!!h.featured}
                                  onChange={(e) => updateHospital(groupIndex, hospitalIndex, "featured", e.target.checked)}
                                />
                                Featured / local representative
                              </label>
                              <button
                                onClick={() => removeHospital(groupIndex, hospitalIndex)}
                                className="flex items-center gap-1 text-xs text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove hospital
                              </button>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-bold text-gray-900">{h.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5 mb-3">{h.location}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {h.tags.map((t) => (
                                  <span key={t} className="text-[11px] font-medium bg-[#eefaf7] text-[#28675f] rounded px-2 py-0.5">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </article>
                    ))}
                    {editMode && (
                      <button
                        onClick={() => addHospital(groupIndex)}
                        className="rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 min-h-[220px]"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs mt-1">Add hospital</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {editMode && (
              <button
                onClick={addGroup}
                className="w-full rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 py-6"
              >
                <Plus className="w-5 h-5" /> Add country group
              </button>
            )}
          </div>

          {/* Best destination by specialty */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">Quick Reference</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Best destination by specialty</h2>
            <div className="grid sm:grid-cols-2 gap-x-10">
              {view.bestDestinations.map((row, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-dotted border-gray-300 gap-3">
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={row.specialty}
                        onChange={(e) => updateBestDestination(index, "specialty", e.target.value)}
                        className="font-semibold text-gray-800 text-sm bg-[#f2f1fa] rounded px-2 py-1 flex-1"
                      />
                      <input
                        type="text"
                        value={row.countries}
                        onChange={(e) => updateBestDestination(index, "countries", e.target.value)}
                        className="text-sm text-gray-500 bg-[#f2f1fa] rounded px-2 py-1 flex-1"
                      />
                      <button onClick={() => removeBestDestination(index)} className="text-red-500 shrink-0" title="Remove">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-gray-800 text-sm">{row.specialty}</span>
                      <span className="text-sm text-gray-500 text-right">{row.countries}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            {editMode && (
              <button
                onClick={addBestDestination}
                className="mt-4 flex items-center gap-1 text-xs text-gray-500 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add row
              </button>
            )}
          </div>

          {/* Advantage */}
          <div className="bg-gradient-to-br from-[#5A53A7] to-[#55C3A9] text-white rounded-2xl shadow-lg p-8 md:p-10 mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/80 mb-1">The Stech Advantage</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Why patients choose us</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {view.advantages.map((a, index) => (
                <div key={index} className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
                  {editMode ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={a.title}
                        onChange={(e) => updateAdvantage(index, "title", e.target.value)}
                        className="font-semibold bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full"
                      />
                      <textarea
                        value={a.desc}
                        onChange={(e) => updateAdvantage(index, "desc", e.target.value)}
                        rows={2}
                        className="text-sm bg-white/90 text-[#2b2860] rounded px-2 py-1 w-full"
                      />
                      <button onClick={() => removeAdvantage(index)} className="flex items-center gap-1 text-xs text-red-200">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold mb-1">{a.title}</h3>
                      <p className="text-sm text-white/85">{a.desc}</p>
                    </>
                  )}
                </div>
              ))}
              {editMode && (
                <button
                  onClick={addAdvantage}
                  className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border-2 border-dashed border-white/40 flex flex-col items-center justify-center text-white/80 hover:text-white"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs mt-1">Add advantage</span>
                </button>
              )}
            </div>
          </div>

          {/* How we work */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 mb-12 border border-gray-100">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-1">Process</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">How we work</h2>
            <ol className="space-y-6">
              {view.processSteps.map((step, i) => (
                <li key={i} className="flex gap-5">
                  <span className="text-2xl font-bold text-[#55C3A9] w-10 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  {editMode ? (
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateProcessStep(i, "title", e.target.value)}
                        className="font-semibold text-gray-900 bg-[#f2f1fa] rounded px-2 py-1 w-full"
                      />
                      <textarea
                        value={step.desc}
                        onChange={(e) => updateProcessStep(i, "desc", e.target.value)}
                        rows={2}
                        className="text-sm text-gray-500 bg-[#f2f1fa] rounded px-2 py-1 w-full"
                      />
                      <button onClick={() => removeProcessStep(i)} className="flex items-center gap-1 text-xs text-red-500">
                        <Trash2 className="w-3.5 h-3.5" /> Remove step
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            {editMode && (
              <button
                onClick={addProcessStep}
                className="mt-6 flex items-center gap-1 text-xs text-gray-500 border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-50"
              >
                <Plus className="w-3.5 h-3.5" /> Add step
              </button>
            )}
          </div>

          {/* Contact form (functional — not part of admin-edited content) */}
          <div id="consult" className="scroll-mt-24 bg-gradient-to-br from-[#f2f1fa] to-[#eefaf7] rounded-2xl border border-gray-100 p-8 md:p-12">
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#55C3A9] mb-2">Free Consultation</p>
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
                    {view.countries.map((c) => (
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
                <a href={`tel:+880${view.hero.contactPhone.slice(1)}`} className="text-[#5A53A7] font-medium">
                  {view.hero.contactPhone}
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
