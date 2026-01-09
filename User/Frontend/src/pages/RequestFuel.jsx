import { Fuel, Droplets, MapPin, Send, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RequestFuel() {
  const navigate = useNavigate();
  const { state } = useLocation(); // pump data comes here

  const [fuelType, setFuelType] = useState("Petrol");
  const [quantity, setQuantity] = useState("5");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!state?.pump) {
    return (
      <div className="min-h-screen bg-[#05080d] flex items-center justify-center text-white">
        Invalid Request
      </div>
    );
  }

  const { pump, distance } = state;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#05080d] text-white p-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ChevronLeft
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-xl font-bold">Fuel Request</h1>
      </div>

      {!submitted ? (
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Pump Info */}
          <div className="bg-[#0a0f18] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-2">{pump.name}</h3>
            <p className="text-slate-400 flex items-center gap-2">
              <MapPin size={16} /> {distance} km away
            </p>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="text-xs uppercase text-slate-400 font-bold">
              Fuel Type
            </label>
            <div className="flex gap-3 mt-2">
              {["Petrol", "Diesel"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFuelType(type)}
                  className={`flex-1 py-3 rounded-xl font-bold transition ${
                    fuelType === type
                      ? "bg-green-500 text-black"
                      : "bg-white/5 text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs uppercase text-slate-400 font-bold">
              Quantity (Liters)
            </label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-[#0a0f18] border border-white/5 rounded-xl text-white"
            >
              <option>2</option>
              <option>5</option>
              <option>10</option>
              <option>15</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs uppercase text-slate-400 font-bold">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Vehicle details, exact location hint..."
              className="w-full mt-2 px-4 py-3 bg-[#0a0f18] border border-white/5 rounded-xl text-white resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-400 transition"
          >
            <Send size={18} /> Confirm Fuel Request
          </button>

        </div>
      ) : (
        /* SUCCESS STATE */
        <div className="max-w-md mx-auto text-center mt-24 space-y-4">
          <Fuel size={48} className="mx-auto text-green-400" />
          <h2 className="text-2xl font-black">Request Sent!</h2>
          <p className="text-slate-400">
            Your fuel request has been successfully sent to the selected petrol pump.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-6 py-3 bg-green-500 text-black font-bold rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
