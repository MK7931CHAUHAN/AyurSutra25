import React, { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
    alert("Message sent!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-700">
            Contact <span className="text-black">Us</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-10">

          {/* LEFT INFO */}
          <div className="space-y-6">
            <Info icon={<Phone />} text="+91 98765 43210" />
            <Info icon={<Mail />} text="support@ayursutra.com" />
            <Info icon={<MapPin />} text="New Delhi, India" />

            <iframe
              className="w-full h-56 rounded-xl shadow"
              loading="lazy"
              src="https://www.google.com/maps?q=New+Delhi&output=embed"
            />
          </div>

          {/* RIGHT FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow space-y-5"
          >
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div>
              <label className="text-sm font-medium text-gray-600">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full flex justify-center items-center gap-2 font-semibold"
            >
              Send Message <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* SMALL COMPONENTS */

const Info = ({ icon, text }) => (
  <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
    <div className="text-green-600">{icon}</div>
    <p className="text-gray-700 font-medium">{text}</p>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      {...props}
      className="w-full mt-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
    />
  </div>
);
